---
description: Screenshot dashboard screens affected by component changes
allowed-tools: Bash(node:*), Bash(open:*)
---

Screenshot dashboard screens that use modified components in `client/dashboard/components/`.

The script automatically:
1. Finds modified components via git diff
2. Parses router files to build page-to-route mappings
3. Finds pages that import the modified components
4. Takes screenshots of affected routes
5. Saves JPEGs to `.claude/commands/screenshots/`

## Run

node .claude/commands/scripts/dashboard-screenshot-affected.mjs && open .claude/commands/screenshots/

## Environment Variables

- `SCREENSHOT_SITE_SLUG` - Site slug for /sites routes (default: first available)
- `BASE_URL` - Target URL (default: http://localhost:3000)
