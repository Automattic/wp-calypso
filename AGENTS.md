# AGENTS.md

## Confidentiality

CRITICAL: This is a **public repository**. Never put an internal link or hostname in a PR description, review comment, commit message, code comment, or any other public-facing text: no wordpress.com URLs (internal sites and P2s), no Slack, Linear, HackerOne, private GitHub repository, or GitHub Enterprise URLs, and no other internal tool URLs. Use shortlinks instead: `PCYsg-hS-p2` for a P2 post, `p<message>-slack-<channel>` for a Slack message (`p<message>/<thread>-slack-<channel>` for a reply in a thread), and the bare issue key (`LIN-123`) for Linear.

## Repository layout

- client/ — main application clients, deployed as single-page React apps.
- packages/ — shared libraries across clients.
- apps/ — standalone mini-apps, deployed separately.

## Clients

- **Calypso** — the classic WordPress.com hosting dashboard, sharing data using Redux and split via Webpack section chunks.
  - client/my-sites — per-site management; deprecated in favor of the Dashboard client
  - client/my-sites/checkout — checkout flow
  - client/me/purchases — redirects to the Dashboard billing screens, plus purchase helpers shared by other sections
  - client/landing/stepper — onboarding/signup flows (site creation, domain purchase, migration wizards)
  - client/reader — WordPress.com Reader: feed streams, discover, conversations, likes, lists, following management
  - Shared infra: client/components, client/state, client/lib, client/layout
- **Jetpack Cloud** (client/jetpack-cloud) — reuses Calypso shared infra (client/state, client/components).
- **A8C for Agencies** (client/a8c-for-agencies) — reuses Calypso shared infra.
- **Dashboard** (client/dashboard) — the new multi-site dashboard. Self-contained: does not reuse Calypso client code. Has its own components, data fetching (TanStack Query), and routing (TanStack Router).
  - client/dashboard/me/billing-purchases — billing & purchase management

## Packages

- **Agents Manager** (`packages/agents-manager`) — shared component library for WordPress.com's unified AI agent experience, running in Calypso, the Dashboard, Simple and Atomic sites, the WooCommerce AI admin and Reader Chat. Also deployed via `apps/agents-manager/` to `widgets.wp.com`. See its `AGENTS.md` for architecture and conventions.
- **AI UI Renderer** (`packages/ai-ui-renderer`) — reusable A2UI v1.0 catalog and rendering primitives built with WordPress components. Agents Manager consumes it; conversation handling and MCP transport stay in consumers.
- **Agenttic** (`packages/agenttic-client`, `packages/agenttic-ui`) — AI agent chat client library and UI components. Also published to npm for consumers outside this repo. ⚠️ Still on its pre-migration package layout (vite-built, ESM-only, flat `dist/`, no `calypso:src`); normalizing it is a future goal, but the published artifact shape is a contract with external consumers — read the Development and Releasing sections in `packages/agenttic-client/README.md` before restructuring or publishing.
- **Help Center** (`packages/help-center`) — shared component library for WordPress.com support. Also deployed via `apps/help-center/` to `widgets.wp.com`.
- **Image Studio** (`packages/image-studio`) — AI-powered image editing and generation. When adding Image Studio entry points, read [packages/image-studio/AGENTS.md](packages/image-studio/AGENTS.md).
- **Calypso Products** (`packages/calypso-products`) — ⚠️ **Avoid.** Deprecated/frozen: a bloated client-side duplicate of product data the backend already owns. Don't add to it; prefer backend-driven data (e.g. `@automattic/api-queries`). See `packages/calypso-products/AGENTS.md`.

## Apps

- **Agents Manager** (`apps/agents-manager`) — build/deploy layer that bundles `packages/agents-manager` into webpack entry points served from `widgets.wp.com`.
- **Help Center** (`apps/help-center`) — build/deploy layer that bundles `packages/help-center` into webpack entry points served from `widgets.wp.com`.
- **Survicate** (`apps/survicate`) — build/deploy layer that bundles `packages/survicate` into the single script wp-admin loads from `widgets.wp.com`. No logic of its own.

## Development

> **Note**: The Calypso dev server listens on the `PORT` set in the environment or the repo-root `.env`. Without one it uses `3000` in the main checkout and, in a linked git worktree, a port derived from the worktree's path (`client/server/config/default-port.js`), which it prints when it starts. The dev server and the verify skill's scripts read `.env` themselves, so you don't need to open it. Do not create or modify `.env` unless explicitly asked.

> **Note**: Keep the `@automattic/` scope whenever a command sends a workspace package name to the npm registry (`npm view`, `npx`, `yarn add`, `yarn npm info`). For a `"private": true` package, read its `package.json` instead of the registry.

```bash
# Setup
yarn install

# Build and start the dev server
yarn start

# Build and start the dev server for the Dashboard client only.
yarn start-dashboard
```

If `yarn start` fails with `Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory`, increase the Node heap size by running `NODE_OPTIONS=--max-old-space-size=8192 yarn start`. For other errors, run `yarn calypso-doctor` to diagnose and fix common environment issues.

## Testing instructions

> **Note**: E2E tests require a local Calypso development instance to be running.

```bash
# JavaScript tests
yarn test                                       # Run unit tests for client, Dashboard, packages, server, and build-tools (CI also runs apps)
yarn test-build-tools                           # Run unit tests for build-tools
yarn test-client                                # Run unit tests for client, except the Dashboard
yarn test-dashboard [path]                      # Run Dashboard unit tests (on Vitest)
yarn test-apps                                  # Run apps unit tests
yarn test-packages [path]                       # Run packages unit tests on Vitest
yarn workspace @automattic/<package> test       # Run a package's own tests, e.g. for packages with a vitest.config
yarn test-server                                # Run server unit tests
yarn test-server:coverage                       # Run server unit tests with coverage info

yarn test-client:watch                          # Run unit tests for client in watch mode
yarn test-client <path_to_test_directory>       # Run client unit tests from a specific directory
yarn test-client --testNamePattern="<TestName>" # Run a specific client unit test
yarn test-dashboard:watch                       # Run Dashboard unit tests in watch mode

# E2E tests - refer to: test/e2e/AGENTS.md

# Code Quality
yarn lint                     # Lint everything
yarn lint:css                 # Lint CSS
yarn lint:js                  # Lint JavaScript
yarn prettier --write <files> # Fix formatting of the files you changed
yarn reformat-files           # Fix formatting of the whole repo with Prettier
yarn typecheck-client         # Type-check client
yarn typecheck-packages       # Type-check packages
yarn typecheck-apps           # Type-check apps
```

## Verifying a change

Before calling a change done, verify it with [.agents/skills/verify/SKILL.md](.agents/skills/verify/SKILL.md). It also covers signing in when you drive a browser yourself, e.g. Claude in Chrome.

Test with an account made for testing. Use your own WordPress.com account only when the user asks for it, and never save network requests from a login: they hold the password and session cookies.

## Conventions

- Do NOT add any verbose code comments that narrate what the change does or why it was made (e.g. `// Added this to fix X`, `// Changed from Y to Z`, restating the code in prose). Such explanation belongs in the PR description, not the source. Only keep comments that a future reader genuinely needs — non-obvious rationale, gotchas, links to context — and match the comment density and style of the surrounding code.
- Fix type errors at the source — do not silence them with `// @ts-expect-error`, `// @ts-ignore`, or `as any` unless you can justify it in the PR description.

## Creating Pull Requests

When taking over an existing PR, check whether its current changes introduce any new companion PR dependencies. Flag any potential dependencies you haven't verified yet.

To commit, push a branch or open a pull request, follow [.agents/skills/create-pr/SKILL.md](.agents/skills/create-pr/SKILL.md). Before marking a PR ready for review, and after each later push, run the How to Test steps the change affects, on a local dev server or on the Calypso Live build of the pushed commit, then fix whatever in the description no longer matches the code. Skipping a step is the exception, only for a step you can't run, for example because it needs access you don't have or changes something you can't undo. Keep a skipped step in the list and say after the steps why you skipped it.
