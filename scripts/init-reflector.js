#!/usr/bin/env node

/**
 * Reflector System Initialization
 *
 * Sets up the infrastructure for systematic agent self-improvement:
 * directory structure, PRINCIPLES.md template, outcome tracking files,
 * and automated cron schedules for daily and weekly reviews.
 *
 * Idempotent: safe to run multiple times. Existing files are preserved.
 *
 * Usage:
 *   node init-reflector.js [options]
 *
 * Options:
 *   --dry-run           Preview changes without writing anything
 *   --timezone <tz>     Timezone for cron jobs (default: auto-detect)
 *   --daily-time HH:MM  Daily review time (default: 03:30)
 *   --weekly-time HH:MM Weekly review time (default: 03:00)
 *   --skip-cron         Create files only, skip cron prompt setup
 *   --help              Show usage information
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const DEFAULTS = {
  dailyTime: '03:30',
  weeklyTime: '03:00',
};

const PROMPTS_DIR = path.join(__dirname, '..', 'prompts');

// ---------------------------------------------------------------------------
// File templates
// ---------------------------------------------------------------------------

/**
 * Returns the starter PRINCIPLES.md content: a framework for building
 * principles, not the principles themselves. Each agent fills this in
 * based on their own experience and outcomes.
 */
function principlesTemplate() {
  return `# PRINCIPLES.md - Decision-Making Framework

*Principles are earned through experience and validated by outcomes.*
*Add them when evidence supports them. Retire them when they stop being useful.*

---

## How This File Works

Each principle should:
1. **Guide decisions** when multiple good options conflict
2. **Be specific enough** to change observable behavior
3. **Include its origin** - what happened that created it
4. **Show evidence** - what outcomes support it

A principle that doesn't change how you act isn't a principle. It's a platitude.

---

<!-- Add your first principle after your first meaningful correction or insight.

Template:

## [Principle Name]

[What this principle means and why it matters. 2-3 sentences.]

**Origin:** [What happened that led to this principle]

**In practice:** [Concrete behavioral guidance - when and how to apply it]

---

-->

*This file evolves. The weekly review process proposes changes based on*
*outcome data. Every addition, modification, and retirement is logged in*
*memory/reflector/principles-history.jsonl.*
`;
}

// ---------------------------------------------------------------------------
// Prompt loading
// ---------------------------------------------------------------------------

/**
 * Reads a prompt file from the prompts/ directory. Prompts are stored as
 * plain text files - the canonical source for both the init script and
 * the reference documentation.
 */
function loadPrompt(name) {
  const file = path.join(PROMPTS_DIR, name);
  return fs.readFileSync(file, 'utf8');
}

// ---------------------------------------------------------------------------
// Time parsing
// ---------------------------------------------------------------------------

/**
 * Validates and parses an HH:MM time string. Returns [hours, minutes]
 * or throws if the format is invalid.
 */
function parseTime(str) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(str);
  if (!match) throw new Error(`Invalid time format: "${str}" (expected HH:MM)`);

  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);

  if (h < 0 || h > 23) throw new Error(`Invalid hour: ${h} (expected 0-23)`);
  if (m < 0 || m > 59) throw new Error(`Invalid minute: ${m} (expected 0-59)`);

  return [h, m];
}

/**
 * Converts an HH:MM time and frequency into a cron expression.
 */
function timeToCron(time, freq) {
  const [h, m] = parseTime(time);
  if (freq === 'weekly') return `${m} ${h} * * 0`;
  return `${m} ${h} * * *`;
}

// ---------------------------------------------------------------------------
// Timezone detection
// ---------------------------------------------------------------------------

function detectTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

/**
 * Core initialization logic, separated from CLI concerns for testability.
 *
 * Options:
 *   root       - Workspace directory (default: cwd)
 *   dryRun     - Preview changes without writing (default: false)
 *   skipCron   - Skip cron prompt loading (default: false)
 *   timezone   - Cron timezone (default: auto-detect)
 *   dailyTime  - Daily review time as HH:MM (default: 03:30)
 *   weeklyTime - Weekly review time as HH:MM (default: 03:00)
 *   log        - Log function (default: console.log)
 *
 * Returns a report object describing what was created and what already existed.
 */
function init(opts = {}) {
  const dryRun = opts.dryRun || false;
  const skipCron = opts.skipCron || false;
  const timezone = opts.timezone || detectTimezone();
  const dailyTime = opts.dailyTime || DEFAULTS.dailyTime;
  const weeklyTime = opts.weeklyTime || DEFAULTS.weeklyTime;
  const root = opts.root || process.cwd();
  const log = opts.log || console.log;

  // Validate times early, before any file operations.
  parseTime(dailyTime);
  parseTime(weeklyTime);

  const report = {
    root,
    timezone,
    dailyTime,
    weeklyTime,
    dryRun,
    created: [],
    existed: [],
    prompts: {},
  };

  log('Initializing Reflector system...\n');
  if (dryRun) log('(dry run - no changes will be written)\n');

  // --- Directory structure ---

  const dirs = [
    'memory',
    'memory/reflector',
    'memory/reflector/weekly-summaries',
  ];

  for (const rel of dirs) {
    const abs = path.join(root, rel);
    if (fs.existsSync(abs)) {
      log(`  exists  ${rel}/`);
      report.existed.push(rel + '/');
    } else {
      log(`  create  ${rel}/`);
      if (!dryRun) fs.mkdirSync(abs, { recursive: true });
      report.created.push(rel + '/');
    }
  }

  // --- Files ---

  const files = [
    ['PRINCIPLES.md', principlesTemplate()],
    ['memory/reflector/outcomes.jsonl', ''],
    ['memory/reflector/principles-history.jsonl', ''],
  ];

  for (const [rel, content] of files) {
    const abs = path.join(root, rel);
    if (fs.existsSync(abs)) {
      log(`  exists  ${rel}`);
      report.existed.push(rel);
    } else {
      log(`  create  ${rel}`);
      if (!dryRun) fs.writeFileSync(abs, content, 'utf8');
      report.created.push(rel);
    }
  }

  // --- Cron prompts ---

  if (!skipCron) {
    const dailyPrompt = loadPrompt('daily-review.txt');
    const weeklyPrompt = loadPrompt('weekly-refinement.txt');

    report.prompts = {
      daily: {
        cron: timeToCron(dailyTime, 'daily'),
        timezone,
        prompt: dailyPrompt,
      },
      weekly: {
        cron: timeToCron(weeklyTime, 'weekly'),
        timezone,
        prompt: weeklyPrompt,
      },
    };

    log(`\nCron configuration:`);
    log(`  Daily review:  ${dailyTime} ${timezone} (${report.prompts.daily.cron})`);
    log(`  Weekly review: ${weeklyTime} Sunday ${timezone} (${report.prompts.weekly.cron})`);
    log(`\n  Prompts loaded from prompts/daily-review.txt and prompts/weekly-refinement.txt`);
    log(`  Create cron jobs via OpenClaw's cron tool using the prompts above.`);
    log(`  Daily: sessionTarget=isolated, delivery=none (silent unless important)`);
    log(`  Weekly: sessionTarget=isolated, delivery=announce (sends summary)`);
  } else {
    log('\nSkipping cron setup (--skip-cron)');
  }

  log('\nDone.');
  log(`\nNext steps:`);
  log(`  1. Create the cron jobs via OpenClaw's cron tool`);
  log(`  2. Open PRINCIPLES.md and add your first principle`);
  log(`  3. Start logging outcomes after significant tasks`);

  return report;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = argv || process.argv.slice(2);
  const opts = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--dry-run':     opts.dryRun = true; break;
      case '--skip-cron':   opts.skipCron = true; break;
      case '--timezone':    opts.timezone = args[++i]; break;
      case '--daily-time':  opts.dailyTime = args[++i]; break;
      case '--weekly-time': opts.weeklyTime = args[++i]; break;
      case '--help': case '-h':
        console.log(`
Reflector System Initialization

Usage: node init-reflector.js [options]

Options:
  --dry-run           Preview without writing
  --timezone <tz>     Cron timezone (default: auto-detect)
  --daily-time HH:MM  Daily review time (default: 03:30)
  --weekly-time HH:MM Weekly review time (default: 03:00)
  --skip-cron         Skip cron prompt setup
  --help              Show this message
`);
        process.exit(0);
      default:
        console.error(`Unknown option: ${args[i]}`);
        process.exit(1);
    }
  }
  return opts;
}

if (require.main === module) {
  init(parseArgs());
}

module.exports = { init, parseArgs, parseTime, timeToCron, principlesTemplate, loadPrompt };
