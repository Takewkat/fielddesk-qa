import { expect } from "@playwright/test";

import { BasePage } from "./base.page";

const SETTLE_TIMEOUT_MS = 5_000;

/** The issue dialog, shared by "New issue" and the details of an existing issue. */
export class IssueDialog extends BasePage {
  private get root() {
    return this.page.getByRole("dialog");
  }

  private get title() {
    return this.root.getByRole("textbox", { name: "Title *" });
  }

  private get saveButton() {
    return this.root.getByRole("button", { name: "Save issue" });
  }

  async fillTitle(title: string) {
    await this.step(`Fill the title "${title}"`, async () => {
      await this.title.fill(title);
    });
  }

  async save() {
    await this.step("Save the issue", async () => {
      await this.saveButton.click();
      await expect(this.root).toBeHidden();
    });
  }

  /** Goes as far as the UI allows: a missing or read-only title, or a hidden or disabled Save, is skipped without waiting. */
  async tryRename(title: string) {
    await this.step(`Try to rename the issue to "${title}"`, async () => {
      if ((await this.title.count()) > 0 && (await this.title.isEditable())) {
        await this.title.fill(title);
      }
      if ((await this.saveButton.isVisible()) && (await this.saveButton.isEnabled())) {
        await this.saveButton.click();
        await this.assertSettled();
      }
    });
  }

  /** The save is over once the dialog closes or shows a message; a reload before that could drop the write. */
  private async assertSettled() {
    await expect(async () => {
      const closed = !(await this.root.isVisible());
      const message = closed ? "" : (await this.root.getByRole("alert").allTextContents()).join("");
      expect(closed || message.trim().length > 0, "dialog closed or shows a message").toBe(true);
    }).toPass({ timeout: SETTLE_TIMEOUT_MS });
  }
}
