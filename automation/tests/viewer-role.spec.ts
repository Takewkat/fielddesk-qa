import { test } from "../src/fixtures";

test(
  "ROLE-001 control: an Editor renames an issue and the change survives a reload",
  { tag: ["@roles", "@happy-path", "@p1"] },
  async ({ issues, store, ownIssue }) => {
    const renamed = `${ownIssue.title} renamed`;

    await issues.tryRename(ownIssue.title, renamed);
    await store.assertTitle(ownIssue.id, renamed);
    await issues.reload();

    await store.assertTitle(ownIssue.id, renamed);
    await issues.assertListed(renamed);
  },
);

test(
  "ROLE-002 a Viewer cannot rename an issue",
  {
    tag: ["@roles", "@error-case", "@p1", "@known-bug"],
    annotation: { type: "issue", description: "BUG-1: Viewer can edit and save an issue" },
  },
  async ({ issues, store, ownIssue }) => {
    await issues.setRole("Viewer");
    await issues.tryRename(ownIssue.title, `${ownIssue.title} by viewer`);
    await issues.reload();

    test.fail(true, "BUG-1 open: only the checks below may fail; remove when Viewer edits are blocked");
    await store.assertTitle(ownIssue.id, ownIssue.title);
    await issues.assertListed(ownIssue.title);
  },
);
