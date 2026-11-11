# Fielddesk QA exercise

A two-hour QA exercise on Fielddesk, a fictional browser-only issue tracker, checked against its Product guide 1.0. The answers live in one file; the rest is the evidence and the working material behind them.

**Start here: [`SUBMISSION.md`](SUBMISSION.md)**: risks and approach, three bug reports, five prioritized test scenarios, what was not tested, how AI tools were used, and the automated test.

| Path | What it holds |
|---|---|
| [`SUBMISSION.md`](SUBMISSION.md) | The answers to the four tasks and the automation note |
| [`automation/`](automation/) | Playwright + TypeScript test for scenario S1, edit path (a Viewer cannot rename an issue); its README covers setup, assertions, isolation and false positives |
| [`evidence/`](evidence/) | Screenshots, exported CSV files and the ROLE-002 trace cited by the answers: `annotated/` bug area marked in red; `BUG-1-*`, `B-*`, `X-` captured while exploring; `A-` scripted Playwright checks |
| [`diagrams/`](diagrams/) | PNG versions of the diagrams in `SUBMISSION.md` |
| [`model/`](model/) | The domain model written from the guide before exploring, annotated with results afterwards: lifecycles, roles, view state, boundary catalogue |

Run the test:

```
cd automation
npm ci && npx playwright install chromium && npm test
```
