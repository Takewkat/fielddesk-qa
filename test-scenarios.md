# Fielddesk: five prioritized test scenarios

The detailed version of part 3 of `SUBMISSION.md`: preconditions, steps and guide quotes for the same five scenarios. Five scenarios, highest priority first. Each one checks one user action against a sentence of the Product guide (version 1.0). S1 is the automated scenario (`automation/`, Playwright + TypeScript); S2 to S5 are written. Results are from 11 Nov 2026 runs on the sample data (12 issues, FD-101 to FD-112, 5 per page).

- **Priority** is what a failure costs the user: P1 data loss, a permission bypass, or wrong data shown or exported; P2 wrong behavior with a visible workaround; P3 cosmetic.
- **Layer** is the kind of input: happy path (valid input), validation error (at or past a documented limit), error case (an action the role is not allowed to take).

## Scenarios

| # | ID | Scenario | Preconditions | Steps | Expected result (guide) | Priority | Layer | Result today |
|---|---|---|---|---|---|---|---|---|
| S1 | ROLE-002 | A Viewer cannot change an issue | Fresh browser profile; as Editor, create an issue with a unique title | Switch "Demo role" to Viewer; open the issue from its title; change the title; Save if the UI allows it; refresh | *"Viewers can browse, search, filter, and export, but cannot change issues."* The title cannot be edited or the save is refused; after refresh the stored issue is unchanged | P1 | Error case | **Automated.** Fails: **BUG-1** (Viewer edits and deletes through the details dialog) |
| S2 | EDIT-001 | An Editor's change to every field survives a refresh | Editor, sample data | Open FD-111; change title, description, project, assignee, status, priority and due date (valid values); Save; check the row; refresh; reopen the issue | *"Saved changes survive a page refresh in the same browser."* Row, dialog and summary cards show every new value, before and after refresh | P1 | Happy path | Fails: **BUG-2** (priority change dropped, "Issue saved" still shown). Other six fields pass |
| S3 | FILTER-001 | Status and priority filters combine, starting from page 1 | Editor, sample data, on page 3 of 3 | Select Status = Open; then Priority = High | *"Status and priority filters apply together. Changing search or filters starts at the first page."* After each change the table is on page 1; the result is only Open AND High issues (FD-101 alone in the sample data); summary cards stay 12 / 4 / 4 / 4 | P1 | Happy path | Fails: **N2** (filters combine with OR: 6 rows), **N3** (page 3 kept: empty table). Cards pass |
| S4 | EXPORT-001 | CSV export holds every matching issue, readable by a CSV parser | Editor creates an issue titled `Check "north" gate, phase 2`; sample FD-103 has a comma in its title | On page 1 with no filter, Export CSV; read the file with a standard CSV reader; repeat with Status = Open | *"CSV export includes all matching issues, across all pages, and preserves text containing commas or quotes."* 13 data rows (12 sample issues + the new one, not the 5 on screen); the filtered file has exactly the Open issues; every row has 7 fields; titles come back unchanged | P1 | Happy path | Fails: **BUG-3** (current page only), **N5** (fields not quoted: the comma splits columns, quotes are lost) |
| S5 | FORM-001 | Title and due-date limits hold on both sides of each boundary | Editor, New issue form | Try each pair, Save, check what is stored. Title after trimming: 2 / 3 characters; 80 / 81; `"  ab  "` / `"  abc  "`; spaces only. Due date: yesterday / today, by local date, including just after local midnight while UTC is still on the previous day | *"Titles must contain 3-80 characters after trimming surrounding spaces."* *"Due dates may be today or in the future, using your local calendar date."* The invalid value of each pair shows a message and nothing is saved; the valid value is saved as entered | P2 | Validation error | Due date: **pass** in Chromium, incl. midnight in Paris (UTC+1) and Los Angeles (UTC-8) with an emulated clock. Title: 2 / 3 and 80 / 81 pass; fails **N6** (length checked before trimming: `"  ab  "` and a spaces-only title are saved, 80 characters + spaces is refused; a spaces-only issue cannot be opened again) |

S1 is the negative test: an action the role must not be able to take. S5 tests boundaries in pairs: each limit with one value that must be refused and one that must be accepted.

## Why these five

| ID | Why it matters |
|---|---|
| ROLE-002 | Roles are the only access control in the product. A read-only role that can edit or delete makes every other guarantee meaningless. The loss is permanent. A deleted sample issue only comes back with Reset, which discards every other change. A deleted user-created issue never comes back. |
| EDIT-001 | Editing is the action users take most. A field missing from the save goes unnoticed because the app confirms "Issue saved". Only a field-by-field check after refresh catches it. |
| FILTER-001 | The filters decide which work people see. OR instead of AND shows the wrong issues. Keeping page 3 shows an empty table although issues match. Both lead users to act on a false picture. |
| EXPORT-001 | CSV is how data leaves the tool, for reports and other systems. A truncated or column-shifted file is wrong data that nobody checks against the screen. |
| FORM-001 | Limits are where code is usually off by one: trimming done after the length check, "today" taken in UTC instead of local time. A wrong limit either blocks valid work or stores bad data. |

The five scenarios cover the five risk areas of the approach: roles, persistence, view state, export and input validation.

## Why S1 is the automated one

- It has the highest severity.
- It reproduces 100% of the time from an empty browser profile.
- Its result can be read from stored data rather than from screen text.
- A control test (ROLE-001: the same steps as an Editor must succeed) shows that a pass is not an accident.

Setup, assertions, data isolation and false results: `automation/README.md`.

## Left out of the five, and why

| Area | Status | Why not in the five |
|---|---|---|
| Due-date sort over all pages | N1 found | Same view-state area as S3; it would be S6 |
| Case-insensitive search by title and ID | N4 found | Same as above; it would be S7 |
| Cancel and Escape discard unsaved edits | Pass | Covered while exploring S2; lower risk once Save is right |
| Reset restores sample data, filters and role, also after refresh | Pass | Low cost of failure: demo-only feature |
| Other Viewer entry points: Enter in a field, switching role while the dialog is open | Not tested | Next extension of S1; one test per entry point |
| Two tabs editing different issues | Not tested | Possible lost update: each save rewrites the whole stored list. Needs two browser contexts |
