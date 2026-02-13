# Methodology

## Table of Contents

1. [Why Reflection Works](#why-reflection-works)
2. [The Three Layers](#the-three-layers)
3. [Why Principles Beat Rules](#why-principles-beat-rules)
4. [Writing Good Principles](#writing-good-principles)
5. [The Daily vs Weekly Cadence](#the-daily-vs-weekly-cadence)
6. [Measuring Improvement](#measuring-improvement)
7. [Common Failure Modes](#common-failure-modes)

---

## Why Reflection Works

Traditional machine learning needs millions of examples to improve. But an agent with good metacognition can change behavior after a single well-analyzed failure.

Three properties make reflection effective:

**Compressed learning.** One correction, properly understood, can prevent a category of future errors. The insight "round numbers from APIs are usually system caps, not real counts" applies to every API interaction forever, not just the one that taught you.

**Transfer across contexts.** A principle learned from email editing ("cut every word that doesn't change the meaning") applies to documentation, chat messages, and reports. Principles generalize in ways that task-specific skills don't.

**Compound improvement.** A 5% improvement in decision quality compounds across thousands of interactions. Over months, the difference between a reflective agent and a non-reflective one becomes enormous.

## The Three Layers

### Skills - "What to do"

Technical capabilities. How to call an API, format a document, search effectively. Skills improve through practice and direct correction.

### Principles - "How to decide"

The judgment layer. What to do when multiple good options conflict. This is where most improvement happens, because decisions are where most mistakes happen.

### Soul - "Who to be"

Identity and values. Stable across contexts. Changes rarely and deliberately. The soul layer determines which principles you develop - an agent that values accuracy over speed will develop different principles than one that values engagement.

**The interaction:** Skills implement principles. Principles serve the soul. When principles conflict, soul-level values break the tie.

## Why Principles Beat Rules

Rules are brittle. "Always provide sources" breaks when discussing opinions. "Respond within 2 hours" fails during emergencies. "Use formal language" is wrong for casual channels. Rules multiply as edge cases emerge, creating an unmanageable tangle.

Principles are flexible. "Confidence should scale with evidence" works for factual claims, predictions, and recommendations across every channel and context. One principle replaces dozens of rules.

**The test for a good principle:** Does it help you decide when two good things conflict? "Be accurate" fails this test - it doesn't tell you what to do when accuracy requires more time than the situation allows. "Verify before asserting" passes - it tells you to check first, even when it's slower.

## Writing Good Principles

**Good principles share four traits:**

1. **Specific** - "Verify quantitative claims with original sources" not "Be accurate"
2. **Contextual** - Clear about when it applies and when it doesn't
3. **Evidence-based** - Supported by actual outcomes, not theoretical concerns
4. **Tension-resolving** - Guides you when good things conflict

**Each principle needs:**

- **Origin** - The specific incident or pattern that created it. Without an origin, a principle is just a nice-sounding sentence. The origin is what makes it sticky.
- **Evidence** - Multiple supporting outcomes. One bad day isn't a principle. A pattern across three weeks is.
- **Application** - When and how to use it. A principle with no application guidance will be ignored under pressure.
- **Rule** - Concrete behavioral guidance. "When X happens, do Y." The more specific, the more useful.

**Principles can come from two sources:**

1. **Failures** - Something went wrong, you analyzed why, and extracted a rule to prevent recurrence. These are the strongest principles because the pain makes them memorable.
2. **Recognized wisdom** - You encounter an idea that clearly applies to your work. You don't need to fail first if you're smart enough to recognize a good idea. But adopted principles need validation through application - they should be treated as candidates until your own outcome data confirms them.

## The Daily vs Weekly Cadence

**Why both matter:**

Daily reviews keep memory fresh. Lessons are clearest the same day they happen. A daily review is cheap - 5 minutes of analysis, a few lines in the outcome log.

Weekly reviews find patterns. Individual outcomes are noisy. A single correction might be random. Three similar corrections across different contexts is a signal. The weekly review steps back far enough to see the signal.

**Why not just weekly?** By day 7, you've lost the specifics. "I think something went wrong with that email on Tuesday" isn't useful. "Human changed 'several key services' to 'several services' - the word 'key' was filler" is useful, and that level of detail is only available same-day.

**Why not just daily?** Daily reviews would over-react. One correction isn't a principle. If you added a principle after every bad outcome, PRINCIPLES.md would be fifty pages of noise. The weekly cadence provides the distance needed to distinguish patterns from incidents.

**The division of labor:**
- Daily: Capture, classify, extract lessons, flag candidates
- Weekly: Analyze patterns, evaluate candidates against quality gates, update principles

## Measuring Improvement

Reflection without measurement is journaling. Measurement without reflection is statistics. You need both.

**What to track:**

- **Outcome quality ratio** - Corrections vs praise over 4-week rolling windows. Is the ratio improving?
- **Principle application** - Are principles actually being used? A principle that never gets applied needs to be sharper or removed.
- **Time to application** - How quickly do new principles start influencing behavior? If a principle sits unused for weeks, it's either too vague or unnecessary.
- **Correction recurrence** - After adding a principle, does the type of correction it addresses actually decrease?

**What not to track:**

- Raw counts without context (10 outcomes this week vs 15 last week means nothing if workload changed)
- Silence as negative (silence often means the output was fine)
- Improvement in areas you weren't measuring before (comparison needs a baseline)

## Common Failure Modes

### Principle proliferation

**Symptom:** Dozens of principles, frequent conflicts, decision paralysis.
**Cause:** Adding a principle after every negative outcome without quality gates.
**Fix:** Enforce the evidence threshold. Three supporting observations minimum. Merge similar principles aggressively. A PRINCIPLES.md with 10 sharp principles beats one with 40 vague ones.

### Reflection without action

**Symptom:** Weekly reviews generate insights but PRINCIPLES.md never changes.
**Cause:** Quality gates set too high, or reviews that analyze without proposing specific changes.
**Fix:** Every weekly review should either propose a specific principle change or explicitly state why no change is needed. "Nothing to change this week" is valid. "Here are some interesting patterns" without action items is not.

### Cargo cult principles

**Symptom:** Principles that sound good but don't change behavior.
**Cause:** Copying principles from external sources without validation through your own outcomes.
**Fix:** Every adopted principle starts as a candidate. It graduates to active only after your own outcome data shows it's useful. "Push back from care, not correctness" is a good idea - but it becomes YOUR principle only when you have your own example of applying it.

### Over-indexing on corrections

**Symptom:** All improvement focuses on avoiding mistakes. No principles about what works well.
**Cause:** Corrections are louder signals than praise. Easy to focus on what went wrong.
**Fix:** Deliberately codify success patterns. If you consistently get praise for a particular approach, that's a principle candidate too. "What to do more of" is as valuable as "what to stop doing."

### Stale principles

**Symptom:** Principles that were useful six months ago but no longer apply.
**Cause:** Context changed but principles didn't. No retirement process.
**Fix:** Monthly review of principle application frequency. If a principle hasn't been applied in 4 weeks, question whether it's still relevant. Archive rather than delete - keep the history.

---

*Methodology is only as good as its application. Read this once to understand the framework. Then close it and go do the work. Come back when something isn't working.*
