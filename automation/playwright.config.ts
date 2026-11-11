import { defineConfig, devices } from "@playwright/test";

/** FIELDDESK_URL overrides the target; the default is the exercise build. */
const BASE_URL =
  process.env.FIELDDESK_URL || "https://fielddesk-qa-lab-1104.terabase-7688.chatgpt.site/";

/** Everything a run writes, one folder to ignore. */
const REPORTS = "reports";

export default defineConfig({
  testDir: "tests",
  outputDir: `${REPORTS}/artifacts`,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [["list"], ["html", { open: "never", outputFolder: `${REPORTS}/html` }]],
  use: {
    baseURL: BASE_URL,
    locale: "en-US",
    timezoneId: "Europe/Paris",
    trace: "on",
    screenshot: "on",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
