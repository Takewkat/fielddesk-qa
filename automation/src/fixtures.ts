import { test as base } from "@playwright/test";

import { IssuesPage } from "./pages/issues.page";
import { WorkspaceStore } from "./workspace-store";

/** An issue the test created through the UI; the sample issues are never touched. */
export type OwnIssue = { id: string; title: string };

type Fixtures = { issues: IssuesPage; store: WorkspaceStore; ownIssue: OwnIssue };

/** "E2E ROLE-001 m3x9k2": the scenario ID plus a run stamp, unique and 3-80 characters as the guide requires. */
const uniqueTitle = (testTitle: string) =>
  `E2E ${testTitle.split(" ")[0]} ${Date.now().toString(36)}`;

/** The test every spec imports: Fielddesk opened on a fresh context (default role Editor), its stored data, and the test's own issue. */
export const test = base.extend<Fixtures>({
  issues: async ({ page }, use) => {
    const issues = new IssuesPage(page);
    await issues.open();
    await use(issues);
  },
  store: async ({ page }, use) => {
    await use(new WorkspaceStore(page));
  },
  ownIssue: async ({ issues, store }, use, testInfo) => {
    const title = uniqueTitle(testInfo.title);
    await issues.create(title);
    await use({ id: await store.idOf(title), title });
  },
});

export { expect } from "@playwright/test";
