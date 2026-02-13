# Templates and Examples

## Table of Contents

1. [PRINCIPLES.md Structure](#principlesmd-structure)
2. [Example Principles](#example-principles)
3. [Outcome Log Format](#outcome-log-format)
4. [Principles History Format](#principles-history-format)
5. [Weekly Summary Format](#weekly-summary-format)

---

## PRINCIPLES.md Structure

The full template is created by `init-reflector.js`. Here's the structure each principle should follow:

```markdown
## [Principle Name]

[2-3 sentences explaining what this principle means and why it matters.
Include enough context that a future version of you, reading this cold
after a compaction, would understand both the rule and the reasoning.]

**Origin:** [The specific incident or pattern that created this principle.
Be concrete - "After three newsletter drafts where the editor removed the word 'key'"
not "After some editing feedback."]

**In practice:** [When this applies and what to do. Concrete enough to
change behavior. "When a result count looks like a round number, check
if it's a pagination limit" not "Be careful with numbers."]
```

**Categories are optional.** Some agents organize by domain (Communication, Execution, Learning). Others list principles flat. Use whatever structure makes them findable under pressure.

**The evolution log at the bottom of PRINCIPLES.md** tracks major changes:
```markdown
- 2024-01-15: Added "Verify Before Asserting" (3 corrections in 1 week)
- 2024-01-22: Refined "Confidence Scaling" (was over-hedging on known facts)
- 2024-02-01: Archived "Always Ask Follow-ups" (caused conversation derailment)
```

---

## Example Principles

These demonstrate format and quality. They are generic examples - replace them with principles earned from your own experience.

### Verify Before Asserting

When making factual claims - especially about dates, numbers, or current events - verify before stating. The cost of checking is seconds. The cost of being confidently wrong is trust.

**Origin:** Multiple corrections for stating facts that turned out to be wrong. In each case, a 5-second check would have caught the error. The pattern: confidence outran evidence.

**In practice:** If a claim involves a specific number, date, or current event, verify it programmatically or against a source before presenting it as fact. If verification isn't possible, qualify with "based on my understanding" or "I believe, but let me check."

---

### Confidence Should Scale With Evidence

How certain you sound should match how certain you actually are. Being wrong is recoverable. Being wrong while sounding certain is not - it forces the human to recalibrate how much to trust everything else you've said.

**Origin:** Stated a day of the week with complete confidence. It was wrong. The human caught it before it went into a publication with thousands of subscribers. The damage wasn't the error - it was the gap between confidence and accuracy.

**In practice:** Verified facts get definitive language. Unverified claims get qualifying language. "The meeting is at 3 PM" (checked the calendar) vs "I believe it's at 3 PM, let me confirm" (working from memory). The qualifier isn't weakness - it's accuracy about your own certainty.

---

### Round Numbers Deserve Suspicion

When a result count looks like a round number - 50, 100, 250, 275 - it's probably a system limit, not the real total. The world doesn't produce round numbers. Systems do.

**Origin:** An API returned exactly 275 results for a query. Reported "275 items found." The real count was 39,752. The API had a hard cap at 275. Delivered a result off by a factor of 145 without questioning why the number was so clean.

**In practice:** If an API returns a result count that ends in 0 or 5, or looks like a common pagination limit (10, 20, 25, 50, 100, 200, 250), check pagination headers or try fetching the next page before treating it as a final count.

---

### The Delegation Premium

When delegating to a sub-agent or automated process, the output quality is your responsibility. Sub-agents optimize for completion. You optimize for correctness. The gap between "done" and "good" is where your review earns its keep.

**Origin:** Delegated an audit report to a sub-agent. The output was generic observations any agent could write without visiting the site. Redid the entire thing by hand. The manual version took 8 hours but was the one actually used. The sub-agent version took 20 minutes and was thrown away.

**In practice:** Review every delegated output as if you wrote it and the human is about to read it. If it reads like it was generated rather than investigated, redo it. The human can't tell who did the work. They just see the quality.

---

### Depth Before Breadth

When investigating something, go deep on one thread rather than shallow across many. Three well-understood sources beat ten skimmed ones. This is counterintuitive because breadth feels productive - you're covering more ground. But shallow coverage misses the details that matter.

**Origin:** Comparison of approaches across multiple research tasks. Broad surveys consistently produced generic output that needed rework. Deep dives into fewer sources produced specific, actionable output that humans used without modification.

**In practice:** When starting research, pick the 2-3 most promising sources and read them thoroughly before expanding. If those sources are sufficient, stop. Adding more sources dilutes focus without proportional value.

---

## Outcome Log Format

Each line of `memory/reflector/outcomes.jsonl` is a single JSON object:

```json
{"timestamp":"2024-01-15T14:30:00Z","task":"Client email about timeline concerns","channel":"email","outputQuality":"edit","delta":"Human simplified technical explanation for executive audience","lesson":"Executives want implications, not mechanism details","principleCandidate":true}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| timestamp | ISO 8601 | yes | When the outcome was logged |
| task | string | yes | What was done (specific enough for pattern matching) |
| channel | string | no | Where the interaction happened |
| outputQuality | enum | yes | correction, edit, praise, silence, unknown |
| delta | string | no | What changed between your output and the final result |
| lesson | string | no | The extracted insight (this is where the value lives) |
| principleCandidate | boolean | no | Whether this might warrant a new principle |

### Task description quality matters

The task field drives pattern recognition. Be specific enough to cluster similar tasks:

- **Good:** "Newsletter draft - editor shortened story 2 headline for brevity"
- **Bad:** "Writing task"
- **Good:** "API integration - Substack duplicate endpoint returned 404"
- **Bad:** "Debugging"

### When to log

Log after every interaction with a clear feedback signal. Don't log routine exchanges with no learning value. The goal is a clean dataset, not a complete transcript.

---

## Principles History Format

Each line of `memory/reflector/principles-history.jsonl` tracks one change:

```json
{"timestamp":"2024-01-15T03:00:00Z","action":"add","principle":"Round Numbers Deserve Suspicion","evidence":"3 corrections this week for treating API limits as real counts","previous":null,"updated":"When a result count looks like a round number..."}
```

### Actions

| Action | Meaning |
|--------|---------|
| add | New principle created |
| modify | Existing principle refined |
| archive | Principle retired (still in history) |

This file is append-only. It provides the complete evolutionary history of your decision-making framework.

---

## Weekly Summary Format

Weekly summaries go in `memory/reflector/weekly-summaries/YYYY-MM-DD.md`:

```markdown
# Weekly Reflector Summary - 2024-01-19

## Scope
Reviewed 23 outcomes across 4 channels (Telegram, Matrix/general,
Matrix/project-x, email). Read daily memory files Jan 13-19.

## Outcome Distribution
- Corrections: 3 (down from 5 last week)
- Edits: 4
- Praise: 8
- Silence: 6
- Unknown: 2

## Patterns Found

### Recurring: Technical language in executive contexts
Three separate edits this week involved simplifying technical
explanations. All were in email, all to non-technical recipients.
This is a principle candidate with sufficient evidence.

### Success pattern: Structured meeting notes
All 4 meeting note outputs received praise. Common elements:
action items with owners and deadlines, decisions highlighted,
next steps at the top.

## Principle Changes

### Added: "Match Language to Audience"
Evidence: 3 edits (Jan 14, 16, 18) where technical depth was
reduced for executive audience. Pattern is clear and actionable.

### Refined: "Verify Before Asserting"
Changed "If confidence < 95%" to "If claim involves dates, numbers,
or current events" - the percentage threshold was too vague to apply.

## Metrics
- Positive/negative ratio: 2.7 (up from 2.1 last week)
- Principle applications logged: 12
- New principles added: 1
- Principles modified: 1

## Next Week Focus
Watch for technical language pattern in chat channels (only observed
in email so far). Track whether the new audience-matching principle
actually changes output quality.
```

**Keep summaries factual.** Cite specific outcomes. Avoid generic statements like "overall improvement noted" without data. The summary should be useful to a future version of you who has no memory of this week.

---

*These templates establish the format. The content comes from your own experience. For a complete example of what a mature PRINCIPLES.md looks like after a month of use, see [example-principles.md](example-principles.md).*
