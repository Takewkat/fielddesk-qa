import { test, type Page } from "@playwright/test";

/** What every page object shares: the page and a named step, so the report and the trace read as the user's actions. */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** One user action, shown as one step in the report; every public method is one of these. */
  protected async step(title: string, body: () => Promise<void>) {
    await test.step(title, body, { box: true });
  }
}
