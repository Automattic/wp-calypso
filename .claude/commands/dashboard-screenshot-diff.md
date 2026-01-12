# Dashboard Screenshots

Take screenshots of Dashboard pages to compare visual differences between trunk and your current branch.

## Instructions

1. Check if auth session exists:
   ```bash
   ls .claude/skills/dashboard-screenshots-diff/auth-state.json
   ```
   If missing or expired, run:
   ```bash
   yarn workspace wp-e2e-tests playwright test .claude/skills/dashboard-screenshots-diff/save-session.spec.ts --headed
   ```
   This opens a browser for manual login. After login, click "Resume" in the Playwright inspector.

2. Take screenshots of routes affected by your PR changes:
   ```bash
   yarn workspace wp-e2e-tests playwright test .claude/skills/dashboard-screenshots-diff/take-screenshots.spec.ts
   ```

   If affected routes include `/sites/$siteSlug/*`, ask the user for their site slug and add `SITE_SLUG="<slug>"` to the command.

3. For headed mode (visible browser), add `--headed` to the command.

4. Screenshots are saved to: `.claude/skills/dashboard-screenshots-diff/screenshots/{branch-name}/`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SITE_SLUG` | - | Required only for `/sites/$siteSlug/*` routes |
| `DOMAIN_NAME` | - | Required only for `/domains/$domainName/*` routes |
| `SCREENSHOT_ROUTES` | (auto) | Override: comma-separated list of explicit routes |

## Comparing Against Production

To compare production (trunk) vs your branch:

1. Screenshot production:
   ```bash
   DASHBOARD_BASE_URL="https://my.wordpress.com" yarn workspace wp-e2e-tests playwright test .claude/skills/dashboard-screenshots-diff/take-screenshots.spec.ts
   ```

2. Screenshot your local branch:
   ```bash
   yarn workspace wp-e2e-tests playwright test .claude/skills/dashboard-screenshots-diff/take-screenshots.spec.ts
   ```

3. Compare the screenshots in `screenshots/trunk/` vs `screenshots/{your-branch}/`
