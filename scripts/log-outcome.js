#!/usr/bin/env node

/**
 * Outcome Logger
 *
 * Appends a structured outcome entry to memory/reflector/outcomes.jsonl.
 * Designed for speed and simplicity: validate, build, append, done.
 *
 * Usage:
 *   node log-outcome.js --task "Draft email" --quality edit --lesson "Keep it shorter"
 *   node log-outcome.js --task "API research" --quality praise --channel telegram
 *   node log-outcome.js --task "Date check" --quality correction --delta "Wrong day" --principle-candidate
 *
 * Quality types:
 *   correction  Human corrected or disagreed with output
 *   edit        Human modified work before using it
 *   praise      Explicit positive feedback
 *   silence     Expected response that didn't come
 *   unknown     Ambiguous feedback signal
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const QUALITY_TYPES = new Set(['correction', 'edit', 'praise', 'silence', 'unknown']);

const DEFAULT_LOG_DIR = 'memory/reflector';
const LOG_FILENAME = 'outcomes.jsonl';

// ---------------------------------------------------------------------------
// Entry construction
// ---------------------------------------------------------------------------

/**
 * Validates inputs and builds a structured outcome entry.
 * Throws on invalid input. Pure function - no side effects.
 */
function buildEntry(opts) {
  if (!opts.task || typeof opts.task !== 'string' || !opts.task.trim()) {
    throw new Error('--task is required and must be a non-empty string');
  }
  if (!opts.quality || !QUALITY_TYPES.has(opts.quality)) {
    throw new Error(
      `--quality must be one of: ${[...QUALITY_TYPES].join(', ')} (got: "${opts.quality || ''}")`
    );
  }

  return {
    timestamp: opts.timestamp || new Date().toISOString(),
    task: opts.task.trim(),
    channel: opts.channel || null,
    outputQuality: opts.quality,
    delta: opts.delta || null,
    lesson: opts.lesson || null,
    principleCandidate: opts.principleCandidate || opts.quality === 'correction',
  };
}

// ---------------------------------------------------------------------------
// File operations
// ---------------------------------------------------------------------------

/**
 * Appends a JSON entry to the outcome log. Creates the directory if needed.
 * Returns the resolved file path.
 */
function appendEntry(entry, opts = {}) {
  const root = opts.root || process.cwd();
  const logPath = path.join(root, DEFAULT_LOG_DIR, LOG_FILENAME);

  const dir = path.dirname(logPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.appendFileSync(logPath, JSON.stringify(entry) + '\n');
  return logPath;
}

// ---------------------------------------------------------------------------
// Combined log function
// ---------------------------------------------------------------------------

/**
 * Validates, builds, and appends an outcome entry. Returns the entry.
 */
function log(opts) {
  const entry = buildEntry(opts);
  appendEntry(entry, { root: opts.root });
  return entry;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = argv || process.argv.slice(2);
  const opts = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--task':                opts.task = args[++i]; break;
      case '--quality':             opts.quality = args[++i]; break;
      case '--delta':               opts.delta = args[++i]; break;
      case '--lesson':              opts.lesson = args[++i]; break;
      case '--channel':             opts.channel = args[++i]; break;
      case '--principle-candidate': opts.principleCandidate = true; break;
      case '--help': case '-h':
        console.log(`
Outcome Logger

Usage: node log-outcome.js --task <desc> --quality <type> [options]

Required:
  --task <description>    What was done
  --quality <type>        correction | edit | praise | silence | unknown

Optional:
  --delta <change>        What changed between output and final result
  --lesson <insight>      What this teaches about effectiveness
  --channel <name>        Communication channel (defaults to OPENCLAW_CHANNEL)
  --principle-candidate   Flag for principle extraction (auto-set for corrections)
`);
        process.exit(0);
      default:
        console.error(`Unknown option: ${args[i]}`);
        process.exit(1);
    }
  }

  // Fall back to environment variable for channel.
  if (!opts.channel && process.env.OPENCLAW_CHANNEL) {
    opts.channel = process.env.OPENCLAW_CHANNEL;
  }

  return opts;
}

if (require.main === module) {
  try {
    const entry = log(parseArgs());
    console.log('Outcome logged.');
    if (entry.principleCandidate) {
      console.log('Flagged as principle candidate.');
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { buildEntry, appendEntry, log, parseArgs, QUALITY_TYPES };
