import { expect, type Page } from "@playwright/test";

import { BasePage } from "./base.page";
import { IssueDialog } from "./issue-dialog.page";

/** The two values of the "Demo role" selector. */
export type Role = "Editor" | "Viewer";

/** The issues screen: the role selector, search, the table and the dialog it opens. */
export class IssuesPage extends BasePage {
  readonly dialog: IssueDialog;

  constructor(page: Page) {
    super(page);
    this.dialog = new IssueDialog(page);
  }

  async open() {
    await this.step("Open Fielddesk", async () => {
      await this.page.goto("/");
      await this.assertLoaded();
    });
  }

  async reload() {
    await this.step("Reload the page", async () => {
      await this.page.reload();
      await this.assertLoaded();
    });
  }

  async setRole(role: Role) {
    await this.step(`Switch the role to ${role}`, async () => {
      const select = this.page.getByRole("combobox", { name: "Demo role" });
      await select.selectOption(role);
      await expect(select).toHaveValue(role);
    });
  }

  async create(title: string) {
    await this.step(`Create the issue "${title}"`, async () => {
      await this.page.getByRole("button", { name: /New issue/ }).click();
      await this.dialog.fillTitle(title);
      await this.dialog.save();
    });
  }

  /** Finds the issue through search, so its page in the table does not matter; returns once the details are rendered. */
  async openIssue(title: string) {
    await this.step(`Open the issue "${title}"`, async () => {
      await this.search(title);
      await this.page.getByRole("link", { name: title, exact: true }).click();
      await expect(
        this.page.getByRole("dialog").getByRole("heading", { name: /Issue details/ }),
      ).toBeVisible();
    });
  }

  async tryRename(title: string, newTitle: string) {
    await this.openIssue(title);
    await this.dialog.tryRename(newTitle);
  }

  async assertListed(title: string) {
    await this.step(`Assert the issue "${title}" is listed`, async () => {
      await this.search(title);
      await expect(this.page.getByRole("link", { name: title, exact: true })).toBeVisible();
    });
  }

  private async search(text: string) {
    await this.page.getByRole("textbox", { name: "Search issues" }).fill(text);
  }

  private async assertLoaded() {
    await expect(this.page.getByRole("heading", { name: "Project issues", level: 1 })).toBeVisible();
  }
}
