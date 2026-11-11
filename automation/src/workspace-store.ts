import { expect, type Page } from "@playwright/test";

/** The localStorage key under which the app persists every issue. */
export const STORAGE_KEY = "fielddesk.workspace.v1";

/** The stored fields the tests read; the app stores more. */
export type StoredIssue = { id: string; title: string };

/** The oracle: what the app persisted, read from localStorage, independent of what the screen shows. Reads are single shots, never retried: a write must be stored by the time the dialog closes. */
export class WorkspaceStore {
  constructor(private readonly page: Page) {}

  async idOf(title: string): Promise<string> {
    const issue = await this.find((i) => i.title === title);
    expect(issue, `issue "${title}" is stored`).toBeDefined();
    return issue!.id;
  }

  async assertTitle(id: string, title: string) {
    expect((await this.find((i) => i.id === id))?.title, `stored title of ${id}`).toBe(title);
  }

  private async find(match: (issue: StoredIssue) => boolean) {
    const issues = await this.page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key) ?? "[]") as StoredIssue[],
      STORAGE_KEY,
    );
    return issues.find(match);
  }
}
