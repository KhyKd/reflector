/**
 * Tests for log-outcome.js
 *
 * Covers: entry validation, construction, file appending, CLI argument
 * parsing, auto-flagging corrections as principle candidates, and
 * directory creation.
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
  buildEntry,
  appendEntry,
  log,
  parseArgs,
  QUALITY_TYPES,
} = require('../scripts/log-outcome.js');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'reflector-log-test-'));
}

function cleanup(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

/** Reads the outcome log as an array of parsed JSON objects. */
function readLog(root) {
  const logPath = path.join(root, 'memory', 'reflector', 'outcomes.jsonl');
  if (!fs.existsSync(logPath)) return [];
  return fs.readFileSync(logPath, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(JSON.parse);
}

// ---------------------------------------------------------------------------
// buildEntry - validation
// ---------------------------------------------------------------------------

describe('buildEntry validation', () => {
  it('rejects missing task', () => {
    assert.throws(() => buildEntry({ quality: 'praise' }), /--task is required/);
  });

  it('rejects empty task', () => {
    assert.throws(() => buildEntry({ task: '  ', quality: 'praise' }), /--task is required/);
  });

  it('rejects non-string task', () => {
    assert.throws(() => buildEntry({ task: 42, quality: 'praise' }), /--task is required/);
  });

  it('rejects missing quality', () => {
    assert.throws(() => buildEntry({ task: 'test' }), /--quality must be one of/);
  });

  it('rejects invalid quality type', () => {
    assert.throws(
      () => buildEntry({ task: 'test', quality: 'great' }),
      /--quality must be one of.*got: "great"/
    );
  });

  it('accepts all valid quality types', () => {
    for (const q of QUALITY_TYPES) {
      const entry = buildEntry({ task: 'test', quality: q });
      assert.equal(entry.outputQuality, q);
    }
  });
});

// ---------------------------------------------------------------------------
// buildEntry - construction
// ---------------------------------------------------------------------------

describe('buildEntry construction', () => {
  it('builds a complete entry with all fields', () => {
    const entry = buildEntry({
      task: 'Draft email',
      quality: 'edit',
      delta: 'Shortened introduction',
      lesson: 'Executives want brevity',
      channel: 'telegram',
      timestamp: '2026-01-15T10:00:00Z',
    });

    assert.equal(entry.task, 'Draft email');
    assert.equal(entry.outputQuality, 'edit');
    assert.equal(entry.delta, 'Shortened introduction');
    assert.equal(entry.lesson, 'Executives want brevity');
    assert.equal(entry.channel, 'telegram');
    assert.equal(entry.timestamp, '2026-01-15T10:00:00Z');
    assert.equal(entry.principleCandidate, false);
  });

  it('defaults optional fields to null', () => {
    const entry = buildEntry({ task: 'test', quality: 'praise' });
    assert.equal(entry.delta, null);
    assert.equal(entry.lesson, null);
    assert.equal(entry.channel, null);
  });

  it('auto-generates timestamp when not provided', () => {
    const before = new Date().toISOString();
    const entry = buildEntry({ task: 'test', quality: 'praise' });
    const after = new Date().toISOString();

    assert.ok(entry.timestamp >= before);
    assert.ok(entry.timestamp <= after);
  });

  it('trims whitespace from task', () => {
    const entry = buildEntry({ task: '  spaced out  ', quality: 'praise' });
    assert.equal(entry.task, 'spaced out');
  });

  it('auto-flags corrections as principle candidates', () => {
    const entry = buildEntry({ task: 'test', quality: 'correction' });
    assert.equal(entry.principleCandidate, true);
  });

  it('does not auto-flag non-corrections', () => {
    for (const q of ['edit', 'praise', 'silence', 'unknown']) {
      const entry = buildEntry({ task: 'test', quality: q });
      assert.equal(entry.principleCandidate, false, `${q} should not be flagged`);
    }
  });

  it('respects explicit principleCandidate flag', () => {
    const entry = buildEntry({
      task: 'test',
      quality: 'edit',
      principleCandidate: true,
    });
    assert.equal(entry.principleCandidate, true);
  });
});

// ---------------------------------------------------------------------------
// appendEntry
// ---------------------------------------------------------------------------

describe('appendEntry', () => {
  let dir;

  beforeEach(() => { dir = tmpDir(); });
  afterEach(() => { cleanup(dir); });

  it('creates directory structure if missing', () => {
    const entry = buildEntry({ task: 'test', quality: 'praise' });
    appendEntry(entry, { root: dir });

    assert.ok(fs.existsSync(path.join(dir, 'memory', 'reflector', 'outcomes.jsonl')));
  });

  it('writes valid JSON lines', () => {
    const entry = buildEntry({ task: 'test', quality: 'praise', timestamp: '2026-01-01T00:00:00Z' });
    appendEntry(entry, { root: dir });

    const lines = readLog(dir);
    assert.equal(lines.length, 1);
    assert.equal(lines[0].task, 'test');
    assert.equal(lines[0].outputQuality, 'praise');
  });

  it('appends multiple entries', () => {
    appendEntry(buildEntry({ task: 'first', quality: 'praise' }), { root: dir });
    appendEntry(buildEntry({ task: 'second', quality: 'edit' }), { root: dir });
    appendEntry(buildEntry({ task: 'third', quality: 'correction' }), { root: dir });

    const lines = readLog(dir);
    assert.equal(lines.length, 3);
    assert.equal(lines[0].task, 'first');
    assert.equal(lines[1].task, 'second');
    assert.equal(lines[2].task, 'third');
  });
});

// ---------------------------------------------------------------------------
// log (combined)
// ---------------------------------------------------------------------------

describe('log', () => {
  let dir;

  beforeEach(() => { dir = tmpDir(); });
  afterEach(() => { cleanup(dir); });

  it('validates, builds, appends, and returns the entry', () => {
    const entry = log({
      task: 'Combined test',
      quality: 'silence',
      lesson: 'No response means OK',
      root: dir,
    });

    assert.equal(entry.task, 'Combined test');
    assert.equal(entry.outputQuality, 'silence');
    assert.equal(entry.lesson, 'No response means OK');

    const lines = readLog(dir);
    assert.equal(lines.length, 1);
    assert.equal(lines[0].task, 'Combined test');
  });

  it('throws on invalid input without writing anything', () => {
    assert.throws(() => log({ quality: 'praise', root: dir }), /--task is required/);

    // Nothing should have been written.
    assert.deepStrictEqual(readLog(dir), []);
  });
});

// ---------------------------------------------------------------------------
// parseArgs
// ---------------------------------------------------------------------------

describe('parseArgs', () => {
  it('parses all flags', () => {
    const opts = parseArgs([
      '--task', 'Write report',
      '--quality', 'edit',
      '--delta', 'Shortened it',
      '--lesson', 'Be concise',
      '--channel', 'matrix',
      '--principle-candidate',
    ]);

    assert.equal(opts.task, 'Write report');
    assert.equal(opts.quality, 'edit');
    assert.equal(opts.delta, 'Shortened it');
    assert.equal(opts.lesson, 'Be concise');
    assert.equal(opts.channel, 'matrix');
    assert.equal(opts.principleCandidate, true);
  });

  it('returns empty object for no arguments', () => {
    const opts = parseArgs([]);
    assert.deepStrictEqual(opts, {});
  });
});
