import { defineConfig, devices } from '@playwright/test';

// Target the live Cloudflare Pages deployment by default.
// Override with BASE_URL=... to test a preview deployment or local server.
const baseURL = process.env.BASE_URL || 'https://organiko.pages.dev';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list']],
  use: {
    baseURL,
    // The sandbox egress gateway terminates TLS with a private CA, so the
    // public pages.dev cert is not trusted here. Ignore cert errors so the
    // suite is portable across environments.
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
