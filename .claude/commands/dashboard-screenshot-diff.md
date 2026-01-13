# Dashboard Screenshots

Take screenshots of Dashboard pages to compare visual differences between production and your current branch.

## Instructions

1. Check the active branch:
   ```bash
   git branch --show-current
   ```
   This identifies which branch screenshots will be saved under.

2. Check if auth session exists:
   ```bash
   ls .claude/skills/dashboard-screenshots-diff/auth-state.json
   ```
   If missing or expired, run:
   ```bash
   cd .claude/skills/dashboard-screenshots-diff && yarn playwright test save-session.spec.ts --headed
   ```
   This opens a browser for manual login. After login, click "Resume" in the Playwright inspector.

3. Take screenshots from **production** (baseline):
   ```bash
   cd .claude/skills/dashboard-screenshots-diff && SCREENSHOT_BRANCH="production" yarn playwright test take-screenshots.spec.ts
   ```

4. Take screenshots from **local branch** (current changes):
   ```bash
   cd .claude/skills/dashboard-screenshots-diff && yarn playwright test take-screenshots.spec.ts
   ```

   If affected routes include `/sites/$siteSlug/*`, ask the user for their site slug and add `SITE_SLUG="<slug>"` to the command.

5. For headed mode (visible browser), add `--headed` to the command.

6. Open both screenshot folders for comparison:
   ```bash
   open .claude/skills/dashboard-screenshots-diff/screenshots/production .claude/skills/dashboard-screenshots-diff/screenshots/{branch-name}
   ```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SITE_SLUG` | - | Required only for `/sites/$siteSlug/*` routes |
| `DOMAIN_NAME` | - | Required only for `/domains/$domainName/*` routes |
| `SCREENSHOT_ROUTES` | (auto) | Override: comma-separated list of explicit routes |
| `SCREENSHOT_BRANCH` | (git branch) | Override branch name; use `production` to screenshot my.wordpress.com |
