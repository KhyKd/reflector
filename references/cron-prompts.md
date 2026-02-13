# Cron Prompts

The daily and weekly prompts are the engine of the Reflector system. They tell the agent how to reflect - and getting this right is the difference between systematic improvement and a glorified diary.

The canonical prompts live in [`prompts/daily-review.txt`](../prompts/daily-review.txt) and [`prompts/weekly-refinement.txt`](../prompts/weekly-refinement.txt). This document explains the design decisions behind them.

---

## Daily Review

**Schedule:** 3:30 AM local time, daily
**Session type:** Isolated (doesn't pollute main session context)
**Delivery:** Silent unless something important needs human attention

### Why this time?

Early morning means the review happens during quiet hours, doesn't interrupt work, and is complete before the day starts. The human wakes up to a clean memory state.

### Design decisions

**Step 1** explicitly lists all channel types because isolated sessions don't have the main session's channel context. Without this instruction, the review might only check the most recent session.

**Step 2** provides concrete signal phrases ("that's not right", "actually...") because abstract instructions like "look for corrections" produce inconsistent results. Specific examples anchor the classification.

**Step 5** specifies the exact JSON format to ensure consistency across days. Inconsistent formats break pattern recognition.

**Step 6** is the key restraint mechanism. Daily reviews identify candidates but don't add principles. This prevents knee-jerk additions after single bad outcomes. The weekly review applies quality gates.

---

## Weekly Refinement

**Schedule:** 3:00 AM Sunday
**Session type:** Isolated
**Delivery:** Announces summary to human (they should see what changed)

### Why Sunday?

The review is complete before the work week starts. Monday begins with updated principles.

### Design decisions

**Step 5** is the quality gate. This is the mechanism that prevents PRINCIPLES.md from becoming a dumping ground. Four explicit tests, all required. The instruction "don't force it" is deliberate - without it, agents tend to add principles to demonstrate productivity.

**Step 6** requires logging every change to the history file. This creates accountability and enables the monthly review to track principle evolution over time.

**Step 7** checks for proliferation. If the principle count keeps growing without principles being archived, the framework is accumulating noise. A healthy system adds and retires in roughly equal measure after the initial ramp-up period.

**Step 8** sends a report to the human. Transparency is essential - the human should see what changed and why. This also creates a feedback loop on the reflection process itself.

---

## Customization

### Adjusting for high-activity agents

If you process dozens of interactions daily, consider:
- Running daily reviews twice (morning and evening)
- Using stricter classification criteria (only log outcomes with clear signals)
- Raising the evidence threshold to 5+ observations

### Adjusting for low-activity agents

If interactions are sparse:
- Weekly review might be sufficient (skip daily)
- Lower the evidence threshold to 2 observations
- Extend the analysis window to 2 weeks for pattern recognition

### Adding channel-specific signals

Customize the classification step for your specific channels:
```
For Slack/Discord: Watch for emoji reactions as feedback signals
  (thumbsup = praise, confused face = unclear output)
For email: Track whether emails are forwarded (praise) or rewritten (edit)
For code review: Track approval rate and revision requests
```

### Adding domain-specific outcome types

The five standard types cover most cases, but you can extend:
```
For coding agents: "test_pass" (code worked first try), "test_fail" (needed fixes)
For writing agents: "published_unedited" (used as-is), "substantial_rewrite"
For research agents: "source_verified" (findings confirmed), "source_incorrect"
```

---

*The prompts are the system. Everything else - the files, the formats, the methodology - exists to support what happens when these prompts run. Get the prompts right and the rest follows.*
