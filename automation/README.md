# Fielddesk: automated browser test

Scenario S1 of `../SUBMISSION.md`, automated with Playwright + TypeScript: **a Viewer cannot rename an issue**. Product guide 1.0, "Working with issues": *"Editors can create, edit, and delete issues. Viewers can browse, search, filter, and export, but cannot change issues."* and *"Saved changes survive a page refresh in the same browser."* It reproduces BUG-1 and is marked as an expected failure until the bug is fixed. Scope is the rename path; Viewer delete is covered by the manual bug report.

## Run

Node 20+ (verified on Node 24):

```
npm ci
npx playwright install chromium
npm test                     # Chromium, headless
npm run test:headed          # watch it run
npm run typecheck
npm run report               # HTML report
```

Every test keeps a trace and a screenshot in `reports/artifacts/`. `FIELDDESK_URL=<url>` targets another build. Firefox: next step; the Playwright Firefox build did not launch on the author's machine, so BUG-1 in Firefox is covered by the manual run.

## Layout

```
tests/viewer-role.spec.ts        the two tests, read as user stories
src/fixtures.ts                  issues (page opened as Editor), store, ownIssue (created per test)
src/pages/issues.page.ts         role selector, search, table, create, open, rename
src/pages/issue-dialog.page.ts   the issue dialog: fill, save, tryRename
src/pages/base.page.ts           step(): every page action is one named step in the report
src/workspace-store.ts           the oracle: issues as the app persisted them in localStorage
```

Specs call fixtures and page objects only; no locator or storage key appears in a spec.

## What runs

| ID | Test | Expected result today |
|---|---|---|
| ROLE-001 | Control: an Editor renames an issue, reloads, the new title is stored and listed | pass |
| ROLE-002 | A Viewer goes through the same edit path, reloads, the title is unchanged | **expected failure** (`test.fail()`, BUG-1): the run is green and lists it as `x` under "passed" |

`test.fail()` is called right before the rule checks, not at the top of the test. A failure while creating the issue, switching role or opening the dialog is therefore a real red failure, never mistaken for the known bug. When BUG-1 is fixed, ROLE-002 passes, Playwright reports "expected to fail, but passed" and the run turns red: remove the `test.fail()` line then.

Trace and screenshot are `on` for every test, because `retain-on-failure` keeps nothing for an expected failure, and the trace of ROLE-002 is the evidence for BUG-1. A copy from a run is committed as `../evidence/ROLE-002-trace.zip` (open it at trace.playwright.dev).

## Assertions

- **Data, not UI.** The guide fixes the rule ("cannot change issues"), not the mechanism: a fix may disable fields, hide Save or show an error. `tryRename()` goes as far as the UI allows, then the test checks, after a reload:
  1. the stored record (`WorkspaceStore`, looked up by issue ID) keeps its title;
  2. searching for the original title still lists the issue.
- **The control test proves the path is real.** ROLE-001 runs the same `tryRename()` as an Editor and asserts the title *does* change. If a shared locator broke and the edit never happened, ROLE-001 fails, so ROLE-002 cannot pass for the wrong reason. `setRole()` asserts the selector's value.
- **No reload before the save settles.** After Save, `tryRename()` waits until the dialog closes or shows a message. ROLE-001 then reads the store once, without retry, before reloading: it proves that a closed dialog means a stored write, which ROLE-002 relies on before its own reload. If the app ever wrote later, ROLE-001 would fail instead of ROLE-002 reading a lost write as "Viewer blocked".
- **The common read-only fixes pass without waiting:** a missing or read-only title field, a hidden or disabled Save. Other fixes fail loudly (see the last row below).

## Test data isolation

- Each test gets a fresh browser context: `localStorage` starts empty and the app loads its built-in sample data. Nothing leaks between tests or into your browser; no cleanup or "Reset demo data" is needed.
- The `ownIssue` fixture creates the test's own issue through the UI, titled `E2E <scenario ID> <run stamp>`. The sample issues FD-101 to FD-112 are never edited, so a change in the sample data does not break the test.
- The issue is opened through search, so its position in the paginated table does not matter.

## Possible false results

| Risk | Effect | Mitigation |
|---|---|---|
| Search breaks | Both tests fail at `openIssue()`, not on the role checks | The control test fails too, so it is not read as "BUG-1 fixed". Search is case-sensitive today (N4); the tests search with the exact title, so they are not affected |
| The storage key or schema changes (`fielddesk.workspace.v1`) | `idOf()` fails with "issue ... is stored" | One constant in `workspace-store.ts`; the UI check stays valid |
| A fix keeps the Viewer edit in memory but does not persist it | ROLE-002 passes after reload, though the screen showed a change before | Accepted: the guide only promises persistence; a stricter test would also check the row before reload |
| Default due date (pre-filled relative to today) | None: the test keeps the default, and locale and time zone are pinned | Dates are never hardcoded |
| Role is not kept across reload (it returns to Editor) | None: the checks read data, not the role | Documented, not asserted: the guide does not specify it |
| Public build down or slow | Navigation timeout in the `issues` fixture | Retries off on purpose: a flaky run should show, not hide |
| BUG-1 fixed another way: no dialog for a Viewer, a Save that does nothing, a refusal shown outside the dialog | ROLE-002 fails red in `openIssue()` or `tryRename()` instead of reporting "expected to fail, but passed" | A loud failure, never a false pass: read it, adapt `tryRename()` to the fix, remove `test.fail()` |
