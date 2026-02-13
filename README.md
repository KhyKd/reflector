# Reflector

A structured self-improvement system for [OpenClaw](https://openclaw.ai) agents.

Most agents accumulate experience but don't learn from it. Reflector implements a feedback loop that transforms interactions into better decision-making principles over time.

```
ACT -> OBSERVE -> EXTRACT -> REFINE -> MEASURE -> ACT
```

## How It Works

1. **You work normally.** Reflector doesn't change how you operate.
2. **A daily review** scans all channels for feedback signals - corrections, edits, praise, silence - and logs structured outcomes.
3. **A weekly review** finds patterns across outcomes, evaluates principle candidates against quality gates, and updates your PRINCIPLES.md when evidence warrants it.
4. **You get better.** Principles guide decisions. Better principles mean better decisions.

See [example-principles.md](references/example-principles.md) for what a mature PRINCIPLES.md looks like after a month of use.

## Setup

### Step 1: Initialize

```bash
# Clone into your OpenClaw workspace
git clone https://github.com/KhyKd/reflector.git

# Initialize (creates PRINCIPLES.md, tracking files, prints cron config)
node reflector/scripts/init-reflector.js

# Preview without writing anything
node reflector/scripts/init-reflector.js --dry-run
```

### Step 2: Create cron jobs

The init script creates your files but cron jobs need to be set up through OpenClaw's cron tool. Create two jobs using the prompts in `prompts/`:

**Daily review** - reads `prompts/daily-review.txt`:
```
Schedule:  30 3 * * *  (3:30 AM daily, adjust to your timezone)
Session:   isolated
Payload:   agentTurn with the contents of prompts/daily-review.txt
Delivery:  none (silent unless something needs human attention)
```

**Weekly refinement** - reads `prompts/weekly-refinement.txt`:
```
Schedule:  0 3 * * 0  (3:00 AM Sunday, adjust to your timezone)
Session:   isolated
Payload:   agentTurn with the contents of prompts/weekly-refinement.txt
Delivery:  announce (sends summary to human)
```

### Step 3: Integrate outcome logging

Add this to your AGENTS.md or equivalent workflow instructions:

```markdown
## After Significant Tasks

When you complete a task and receive feedback (correction, edit, praise,
or notable silence), log the outcome:

  node reflector/scripts/log-outcome.js \
    --task "<what you did>" \
    --quality <correction|edit|praise|silence|unknown> \
    --delta "<what changed between your output and the final result>" \
    --lesson "<what this teaches>"

Not every task needs logging. Log when there's a clear feedback signal -
the human corrected you, rewrote your output, praised your work, or
conspicuously didn't respond to something important.
```

## Log Outcomes

```bash
node reflector/scripts/log-outcome.js \
  --task "Drafted client email" \
  --quality edit \
  --delta "Human shortened technical explanation" \
  --lesson "Executives want implications, not details"
```

Quality types: `correction` | `edit` | `praise` | `silence` | `unknown`

The `--lesson` flag is where the value lives. A log without a lesson is just a record. A log with a lesson is raw material for principles.

## Quality Gates

Principles aren't added on impulse. Before a principle graduates from candidate to active, it must pass all four gates:

- **Evidence threshold** - 3+ supporting outcome observations
- **Tension test** - Does it guide decisions when multiple good options conflict? (A principle that just says "be accurate" isn't a principle - it doesn't help when accuracy conflicts with speed.)
- **Specificity test** - Would it change observable behavior?
- **Uniqueness test** - Not already covered by existing principles?

## Tests

```bash
npm test
```

40 tests covering initialization, outcome logging, validation, idempotency, and CLI parsing. Uses Node's built-in test runner - no dependencies.

## Documentation

| File | What it covers |
|------|----------------|
| [SKILL.md](SKILL.md) | OpenClaw skill integration |
| [references/methodology.md](references/methodology.md) | Why principles beat rules, the three-layer model, failure modes |
| [references/templates.md](references/templates.md) | PRINCIPLES.md framework, example principles, log formats |
| [references/example-principles.md](references/example-principles.md) | Complete example of a mature PRINCIPLES.md |
| [references/cron-prompts.md](references/cron-prompts.md) | Design decisions behind the review prompts |

## Requirements

- Node.js >= 18
- [OpenClaw](https://openclaw.ai) (for cron scheduling and session history)

## License

MIT
