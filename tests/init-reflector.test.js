/**
 * Tests for init-reflector.js
 *
 * Covers: file creation, idempotency, time parsing, cron expression
 * generation, dry-run mode, CLI argument parsing, and prompt loading.
 *
 * Uses Node's built-in test runner (node --test). No dependencies.
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  init,
  parseArgs,
  parseTime,
  timeToCron,
  principlesTemplate,
  loadPrompt,
} = require('../scripts/init-reflector.js');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Creates a temporary directory and returns its path. */
function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'reflector-test-'));
}

/** Silences console output during init calls. */
function silent() {
  return () => {};
}

/** Removes a directory tree. */
function cleanup(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

// ---------------------------------------------------------------------------
// parseTime
// ---------------------------------------------------------------------------

describe('parseTime', () => {
  it('parses valid HH:MM strings', () => {
    assert.deepStrictEqual(parseTime('03:30'), [3, 30]);
    assert.deepStrictEqual(parseTime('0:00'), [0, 0]);
    assert.deepStrictEqual(parseTime('23:59'), [23, 59]);
    assert.deepStrictEqual(parseTime('12:05'), [12, 5]);
  });

  it('rejects invalid formats', () => {
    assert.throws(() => parseTime('3:5'), /Invalid time format/);
    assert.throws(() => parseTime('abc'), /Invalid time format/);
    assert.throws(() => parseTime(''), /Invalid time format/);
    assert.throws(() => parseTime('12'), /Invalid time format/);
    assert.throws(() => parseTime('12:60'), /Invalid minute/);
    assert.throws(() => parseTime('25:00'), /Invalid hour/);
    assert.throws(() => parseTime('-1:00'), /Invalid time format/);
  });
});

// ---------------------------------------------------------------------------
// timeToCron
// ---------------------------------------------------------------------------

describe('timeToCron', () => {
  it('generates daily cron expressions', () => {
    assert.equal(timeToCron('03:30', 'daily'), '30 3 * * *');
    assert.equal(timeToCron('0:00', 'daily'), '0 0 * * *');
    assert.equal(timeToCron('23:59', 'daily'), '59 23 * * *');
  });

  it('generates weekly (Sunday) cron expressions', () => {
    assert.equal(timeToCron('03:00', 'weekly'), '0 3 * * 0');
    assert.equal(timeToCron('12:30', 'weekly'), '30 12 * * 0');
  });
});

// ---------------------------------------------------------------------------
// principlesTemplate
// ---------------------------------------------------------------------------

describe('principlesTemplate', () => {
  it('returns a non-empty string with the expected header', () => {
    const tmpl = principlesTemplate();
    assert.ok(tmpl.length > 100);
    assert.ok(tmpl.includes('PRINCIPLES.md'));
    assert.ok(tmpl.includes('Decision-Making Framework'));
  });

  it('contains the principle template comment', () => {
    const tmpl = principlesTemplate();
    assert.ok(tmpl.includes('## [Principle Name]'));
    assert.ok(tmpl.includes('**Origin:**'));
    assert.ok(tmpl.includes('**In practice:**'));
  });
});

// ---------------------------------------------------------------------------
// loadPrompt
// ---------------------------------------------------------------------------

describe('loadPrompt', () => {
  it('loads the daily review prompt', () => {
    const prompt = loadPrompt('daily-review.txt');
    assert.ok(prompt.includes('Reflector daily review'));
    assert.ok(prompt.includes('GATHER'));
    assert.ok(prompt.includes('CLASSIFY'));
  });

  it('loads the weekly refinement prompt', () => {
    const prompt = loadPrompt('weekly-refinement.txt');
    assert.ok(prompt.includes('Reflector weekly refinement'));
    assert.ok(prompt.includes('PRINCIPLE CANDIDATES'));
    assert.ok(prompt.includes('quality gates'));
  });

  it('throws for nonexistent prompts', () => {
    assert.throws(() => loadPrompt('nonexistent.txt'), /ENOENT/);
  });
});

// ---------------------------------------------------------------------------
// parseArgs
// ---------------------------------------------------------------------------

describe('parseArgs', () => {
  it('parses all flags', () => {
    const opts = parseArgs([
      '--dry-run',
      '--timezone', 'America/Toronto',
      '--daily-time', '04:00',
      '--weekly-time', '02:00',
      '--skip-cron',
    ]);
    assert.equal(opts.dryRun, true);
    assert.equal(opts.timezone, 'America/Toronto');
    assert.equal(opts.dailyTime, '04:00');
    assert.equal(opts.weeklyTime, '02:00');
    assert.equal(opts.skipCron, true);
  });

  it('returns empty object for no arguments', () => {
    const opts = parseArgs([]);
    assert.deepStrictEqual(opts, {});
  });
});

// ---------------------------------------------------------------------------
// init - file creation
// ---------------------------------------------------------------------------

describe('init', () => {
  let dir;

  beforeEach(() => { dir = tmpDir(); });
  afterEach(() => { cleanup(dir); });

  it('creates the expected directory structure', () => {
    init({ root: dir, skipCron: true, log: silent() });

    assert.ok(fs.existsSync(path.join(dir, 'memory')));
    assert.ok(fs.existsSync(path.join(dir, 'memory', 'reflector')));
    assert.ok(fs.existsSync(path.join(dir, 'memory', 'reflector', 'weekly-summaries')));
  });

  it('creates PRINCIPLES.md with template content', () => {
    init({ root: dir, skipCron: true, log: silent() });

    const content = fs.readFileSync(path.join(dir, 'PRINCIPLES.md'), 'utf8');
    assert.ok(content.includes('Decision-Making Framework'));
  });

  it('creates empty JSONL tracking files', () => {
    init({ root: dir, skipCron: true, log: silent() });

    const outcomes = fs.readFileSync(
      path.join(dir, 'memory', 'reflector', 'outcomes.jsonl'), 'utf8'
    );
    const history = fs.readFileSync(
      path.join(dir, 'memory', 'reflector', 'principles-history.jsonl'), 'utf8'
    );
    assert.equal(outcomes, '');
    assert.equal(history, '');
  });

  it('is idempotent - does not overwrite existing files', () => {
    // First run creates files.
    init({ root: dir, skipCron: true, log: silent() });

    // Write custom content to PRINCIPLES.md.
    const custom = '# My Custom Principles\n';
    fs.writeFileSync(path.join(dir, 'PRINCIPLES.md'), custom);

    // Second run preserves custom content.
    init({ root: dir, skipCron: true, log: silent() });
    const content = fs.readFileSync(path.join(dir, 'PRINCIPLES.md'), 'utf8');
    assert.equal(content, custom);
  });

  it('returns a report with created and existed lists', () => {
    const report1 = init({ root: dir, skipCron: true, log: silent() });
    assert.ok(report1.created.length > 0);
    assert.equal(report1.existed.length, 0);

    const report2 = init({ root: dir, skipCron: true, log: silent() });
    assert.equal(report2.created.length, 0);
    assert.ok(report2.existed.length > 0);
  });
});

// ---------------------------------------------------------------------------
// init - dry run
// ---------------------------------------------------------------------------

describe('init --dry-run', () => {
  let dir;

  beforeEach(() => { dir = tmpDir(); });
  afterEach(() => { cleanup(dir); });

  it('creates nothing when dry-run is true', () => {
    init({ root: dir, dryRun: true, skipCron: true, log: silent() });

    assert.ok(!fs.existsSync(path.join(dir, 'memory')));
    assert.ok(!fs.existsSync(path.join(dir, 'PRINCIPLES.md')));
  });

  it('still returns a report with what would be created', () => {
    const report = init({ root: dir, dryRun: true, skipCron: true, log: silent() });
    assert.ok(report.created.length > 0);
    assert.equal(report.dryRun, true);
  });
});

// ---------------------------------------------------------------------------
// init - cron prompt loading
// ---------------------------------------------------------------------------

describe('init with cron', () => {
  let dir;

  beforeEach(() => { dir = tmpDir(); });
  afterEach(() => { cleanup(dir); });

  it('loads prompts and includes cron config in report', () => {
    const report = init({
      root: dir,
      timezone: 'Asia/Bangkok',
      dailyTime: '03:30',
      weeklyTime: '03:00',
      log: silent(),
    });

    assert.ok(report.prompts.daily);
    assert.ok(report.prompts.weekly);
    assert.equal(report.prompts.daily.cron, '30 3 * * *');
    assert.equal(report.prompts.weekly.cron, '0 3 * * 0');
    assert.equal(report.prompts.daily.timezone, 'Asia/Bangkok');
    assert.ok(report.prompts.daily.prompt.includes('Reflector daily review'));
    assert.ok(report.prompts.weekly.prompt.includes('Reflector weekly refinement'));
  });

  it('validates time before creating any files', () => {
    assert.throws(
      () => init({ root: dir, dailyTime: '25:00', log: silent() }),
      /Invalid hour/
    );
    // No files should have been created.
    assert.ok(!fs.existsSync(path.join(dir, 'memory')));
  });
});
