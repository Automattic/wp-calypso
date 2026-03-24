# Agents Manager App

Build and deployment layer for the Agents Manager on Simple and Atomic sites. Most Agents Manager code lives in `packages/agents-manager/` — see `packages/agents-manager/AGENTS.md` for the primary spec.

## Overview

This app takes `@automattic/agents-manager` and bundles it into 8 separate webpack entry points deployed to `widgets.wp.com/agents-manager/`. Jetpack enqueues these bundles on various types of websites and pages (editor, wp-admin, CIAB).

## Entry Points

| Entry point                                 | Context                                           |
| ------------------------------------------- | ------------------------------------------------- |
| `agents-manager-gutenberg.js`               | Gutenberg editor (connected)                      |
| `agents-manager-gutenberg-disconnected.js`  | Gutenberg editor (disconnected from Jetpack)      |
| `agents-manager-wp-admin.js`                | wp-admin bar (connected, dual-mode: full/headless)|
| `agents-manager-wp-admin-disconnected.js`   | wp-admin bar (disconnected from Jetpack)          |
| `agents-manager-ciab.js`                    | CIAB admin (connected)                            |
| `agents-manager-ciab-disconnected.js`       | CIAB admin (disconnected)                         |
| `image-studio.js`                           | Standalone Image Studio integration               |
| `block-notes.js`                            | Standalone Block Notes integration                |

Each entry point is a standalone JS file in the app root that imports from `@automattic/agents-manager` (or `@automattic/image-studio` / `@automattic/block-notes`) and wires up environment-specific bootstrap logic.

## Build & Sync Commands

```bash
# Dev build + sync to sandbox (use during development)
cd apps/agents-manager
yarn dev --sync

# Production build (for deployment)
cd apps/agents-manager
yarn build
```

Both `dev` and `build` use `calypso-apps-builder` to compile webpack bundles. The `--sync` flag syncs them to `widgets.wp.com/agents-manager/` on your sandbox.

## Sandbox Testing

1. Sandbox `widgets.wp.com` (the sites themselves do not need sandboxing).
2. Run `yarn dev --sync` from `apps/agents-manager/`.
3. Visit any Simple, Atomic, or CIAB site.
4. Open the Agents Manager and verify your changes.

## Deployment

1. Connect to your sandbox and run: `install-plugin.sh am --release`
2. When prompted where to push the branch, select the WPCOM repository.
3. This will create a PR on the WPCOM repository.
4. Once checks pass, merge the PR.
5. Deploy wpcom: `deploy wpcom`

This deploys the Agents Manager bundles and language files for Jetpack consumption (served via `widgets.wp.com`).

## Translations

Translations are uploaded to `widgets.wp.com/agents-manager/languages`. They're downloaded in Jetpack during the build process.

> [!IMPORTANT]
> If you add new phrases to the Agents Manager, they will only be translated on Atomic sites after `jetpack-mu-plugin` is released, which happens twice a day.

## PR Guidelines

For PRs that **only** touch `apps/agents-manager/` (build config, entry point wiring):

```markdown
## Testing Instructions

1. Sandbox `widgets.wp.com` (the sites themselves do not need sandboxing).
2. Run `cd apps/agents-manager && yarn dev --sync`.
3. Visit any Simple, Atomic, or CIAB site.
4. Open the Agents Manager and verify it loads and functions correctly.
```

For PRs that also touch `packages/agents-manager/`, follow the PR guidelines in `packages/agents-manager/AGENTS.md` instead (which includes both Calypso and Simple/Atomic testing).
