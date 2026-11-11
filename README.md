# Fielddesk QA exercise

A two-hour QA exercise on Fielddesk, a fictional browser-only issue tracker, checked against its Product guide 1.0. The answers live in one file; the rest is the evidence and the working material behind them.

**Start here: [`SUBMISSION.md`](SUBMISSION.md)**: risks and approach, three bug reports, five prioritized test scenarios, what was not tested, how AI tools were used, and the automated test.

| Path | What it holds |
|---|---|
| [`SUBMISSION.md`](SUBMISSION.md) | The answers to the four tasks and the automation note |
| [`automation/`](automation/) | Playwright + TypeScript test for scenario S1 (a Viewer cannot change an issue); its README covers setup, assertions, isolation and false positives |
| [`test-scenarios.md`](test-scenarios.md) | The five scenarios in full: preconditions, steps, expected result quoted from the guide |
| [`evidence/`](evidence/) | Screenshots and exported CSV files cited by the bug reports (`X-` exploration, `A-` automation) |
| [`diagrams/`](diagrams/) | Approach, risk map, lifecycle and root-cause diagrams |
| [`model/`](model/) | The domain model written from the guide before exploring: lifecycles, roles, view state, boundary catalogue |

Run the test:

```
cd automation
npm ci && npx playwright install chromium && npm test
```
