---
name: reflector
description: >
  Structured self-improvement system for AI agents. Implements a reflection
  loop that transforms interactions into learning through outcome tracking,
  daily reviews, weekly principle refinement, and measurable improvement.
  Use when setting up systematic agent learning, creating PRINCIPLES.md
  frameworks, scheduling reflection cron jobs, or logging task outcomes
  for pattern recognition.
---

# Reflector

A system for getting better at what you do, systematically, over time.

## The Problem

Most agents accumulate experience but don't learn from it. They make the same mistakes, miss the same patterns, and never refine their judgment. Memory files capture what happened. Reflector captures what it means.

## The Solution

A feedback loop:

```
ACT -> OBSERVE -> EXTRACT -> REFINE -> MEASURE -> ACT
```

1. **Act** - Do work normally
2. **Observe** - Daily review classifies outcomes from all channels
3. **Extract** - Identify patterns across accumulated observations
4. **Refine** - Update decision-making principles based on evidence
5. **Measure** - Track whether changes actually improve outcomes

Improvement happens through better principles and sharper self-knowledge, not model retraining.

## Setup

### Step 1: Initialize

Run from your workspace root:

```bash
node /path/to/reflector/scripts/init-reflector.js
```

This creates:
- `PRINCIPLES.md` - Your decision-making framework (if none exists)
- `memory/reflector/outcomes.jsonl` - Structured outcome log
- `memory/reflector/principles-history.jsonl` - Principle change tracking
- `memory/reflector/weekly-summaries/` - Weekly review outputs

Run `--help` for options, `--dry-run` to preview.

### Step 2: Create cron jobs

Use the OpenClaw cron tool to create two jobs. The prompt text is in the
`prompts/` directory - read the file and use its contents as the agentTurn message.

**Daily review** (reads `prompts/daily-review.txt`):
- Schedule: `30 3 * * *` (3:30 AM, adjust to your timezone)
- Session: isolated
- Delivery: none (silent unless something needs human attention)

**Weekly refinement** (reads `prompts/weekly-refinement.txt`):
- Schedule: `0 3 * * 0` (3:00 AM Sunday)
- Session: isolated
- Delivery: announce (sends summary to human)

### Step 3: Integrate outcome logging

After significant tasks where you receive clear feedback, log the outcome:

```bash
node /path/to/reflector/scripts/log-outcome.js \
  --task "Drafted client email" \
  --quality edit \
  --delta "Human shortened technical explanation" \
  --lesson "Executives want implications, not details"
```

**When to log:** Not every task. Log when there's a clear feedback signal -
a correction, a rewrite, explicit praise, or conspicuous silence on something
important. The daily review also catches signals you miss.

Quality types: `correction`, `edit`, `praise`, `silence`, `unknown`

The `--lesson` flag is where the value lives. A log without a lesson is
just a record. A log with a lesson is raw material for principles.

## How Principles Work

Good principles resolve tensions. They tell you what to do when multiple
good options conflict.

**Good:** "Confidence should scale with evidence" - guides the accuracy/speed tradeoff
**Bad:** "Be accurate" - says nothing about what to do when accuracy costs time

Each principle needs:
- **Origin** - What happened that created this principle
- **Evidence** - Specific outcomes that support it
- **Application** - When and how to apply it

See [example-principles.md](references/example-principles.md) for what a
mature PRINCIPLES.md looks like after a month of use. See
[templates.md](references/templates.md) for the full framework.

## Quality Gates

Principles don't get added on impulse. The system enforces:

- **Evidence threshold** - 3+ supporting outcome observations before adding
- **Tension test** - Does it guide decisions when multiple good options conflict? (A principle that just says "be accurate" fails this - it doesn't help when accuracy conflicts with speed.)
- **Specificity test** - Would this change observable behavior?
- **Uniqueness test** - Not already covered by existing principles?

## Running Tests

```bash
npm test
```

Uses Node's built-in test runner. No dependencies required.

## Project Structure

```
reflector/
  SKILL.md                         This file
  README.md                        GitHub-facing documentation
  LICENSE                          MIT
  package.json                     Project metadata and scripts
  prompts/
    daily-review.txt               Canonical daily cron prompt
    weekly-refinement.txt          Canonical weekly cron prompt
  scripts/
    init-reflector.js              Setup script (idempotent)
    log-outcome.js                 Outcome logging CLI
  references/
    methodology.md                 Why this approach works
    templates.md                   PRINCIPLES.md framework and formats
    example-principles.md          Complete example after one month
    cron-prompts.md                Design decisions behind the prompts
  tests/
    init-reflector.test.js         40 tests covering all script logic
    log-outcome.test.js
```

## Deeper Reading

- **[methodology.md](references/methodology.md)** - Why principles beat rules, the three-layer model, common failure modes
- **[templates.md](references/templates.md)** - PRINCIPLES.md framework, example principles, outcome log format
- **[example-principles.md](references/example-principles.md)** - What a mature PRINCIPLES.md looks like
- **[cron-prompts.md](references/cron-prompts.md)** - Design decisions behind the review prompts
