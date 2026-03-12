# Help Center App

Build and deployment layer for the Help Center on Simple and Atomic sites. Most Help Center code lives in `packages/help-center/` — see `packages/help-center/AGENTS.md` for the primary spec.

## Overview

This app takes `@automattic/help-center` and bundles it into 8 separate webpack entry points deployed to `widgets.wp.com/help-center/`. Jetpack enqueues these bundles on various types of websites and pages (editor, wp-admin, logged out pages (/support and /forums), CIAB)

## Entry Points

| Entry point                              | Context                                      |
| ---------------------------------------- | -------------------------------------------- |
| `help-center-gutenberg.js`               | Gutenberg editor (connected)                 |
| `help-center-gutenberg-disconnected.js`  | Gutenberg editor (disconnected from Jetpack) |
| `help-center-wp-admin.js`                | wp-admin bar (connected)                     |
| `help-center-wp-admin-disconnected.js`   | wp-admin bar (disconnected from Jetpack)     |
| `help-center-ciab-admin.js`              | CIAB admin (connected)                       |
| `help-center-ciab-admin-disconnected.js` | CIAB admin (disconnected)                    |
| `help-center-customizer.js`              | Customizer                                   |
| `help-center-logged-out.js`              | Logged-out view                              |

Each entry point is a standalone JS file in the app root (e.g., `help-center-gutenberg.js`) that imports from `@automattic/help-center` and wires up the environment-specific bootstrap logic.

## Build & Sync Commands

```bash
# Dev build + sync to sandbox (use during development)
cd apps/help-center
yarn dev --sync

# Production build + sync (use before deploying)
cd apps/help-center
yarn build --sync
```

Both commands use `calypso-apps-builder` to compile webpack bundles and sync them to `widgets.wp.com/help-center/` on your sandbox.

## Sandbox Testing

1. Sandbox `widgets.wp.com` (the sites themselves do not need sandboxing).
2. Run `yarn dev --sync` from `apps/help-center/`.
3. Visit any Simple, Atomic, or CIAB site.
4. Open the Help Center and verify your changes.

## Deployment

1. Connect to your sandbox and run: `install-plugin.sh hc --release`
2. Merge the PR.
3. Deploy wpcom: `deploy wpcom`

This deploys the Help Center bundles and language files for Jetpack consumption (and to then serve it via widgets).

## PR Guidelines

For PRs that **only** touch `apps/help-center/` (build config, entry point wiring):

```markdown
## Testing Instructions

1. Sandbox `widgets.wp.com` (the sites themselves do not need sandboxing).
2. Run `cd apps/help-center && yarn dev --sync`.
3. Visit any Simple, Atomic, or CIAB site.
4. Open the Help Center and verify it loads and functions correctly.
```

For PRs that also touch `packages/help-center/`, follow the PR guidelines in `packages/help-center/AGENTS.md` instead (which includes both Calypso and Simple/Atomic testing).
