# AGENTS.md

## Repository layout

- client/ — main application clients, deployed as single-page React apps.
- packages/ — shared libraries across clients.
- apps/ — standalone mini-apps, deployed separately.

## Clients

- **Calypso** — the classic WordPress.com hosting dashboard, sharing data using Redux and split via Webpack section chunks.
  - client/my-sites — per-site management; deprecated in favor of the Dashboard client
  - client/my-sites/checkout — checkout flow
  - client/me/purchases — purchase management
  - client/landing/stepper — onboarding/signup flows (site creation, domain purchase, migration wizards)
  - client/reader — WordPress.com Reader: feed streams, discover, conversations, likes, lists, following management
  - Shared infra: client/components, client/state, client/lib, client/layout
- **Jetpack Cloud** (client/jetpack-cloud) — reuses Calypso shared infra (client/state, client/components).
- **A8C for Agencies** (client/a8c-for-agencies) — reuses Calypso shared infra.
- **Dashboard** (client/dashboard) — the new multi-site dashboard. Self-contained: does not reuse Calypso client code. Has its own components, data fetching (TanStack Query), and routing (TanStack Router).
  - client/dashboard/me/billing-purchases — billing & purchase management

## Packages

- **Help Center** (`packages/help-center`) — shared component library for WordPress.com support. Also deployed via `apps/help-center/` to `widgets.wp.com`.
- **Image Studio** (`packages/image-studio`) — AI-powered image editing and generation
- **Block Notes** (`packages/block-notes`) — AI-powered block commenting system for WordPress
- **Calypso Products** (`packages/calypso-products`) — ⚠️ **Avoid.** Deprecated/frozen: a bloated client-side duplicate of product data the backend already owns. Don't add to it; prefer backend-driven data (e.g. `@automattic/api-queries`). See `packages/calypso-products/AGENTS.md`.

## Apps

- **Help Center** (`apps/help-center`) — build/deploy layer that bundles `packages/help-center` into webpack entry points served from `widgets.wp.com`.

## Development

> **Note**: The Calypso dev server uses the `PORT` environment variable (check repo-root `.env`) and falls back to port `3000`. Do not create or modify `.env` unless explicitly asked.

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
yarn test                                       # Run unit tests for client, packages, server, and build-tools
yarn test-build-tools                           # Run unit tests for build-tools
yarn test-client                                # Run unit tests for client
yarn test-integration                           # Run integration tests
yarn test-apps                                  # Run apps unit tests
yarn test-packages                              # Run packages unit tests
yarn test-server                                # Run server unit tests
yarn test-server:coverage                       # Run server unit tests with coverage info

yarn test-client:watch                          # Run unit tests for client in watch mode
yarn test-client <path_to_test_directory>       # Run client unit tests from a specific directory
yarn test-client --testNamePattern="<TestName>" # Run a specific client unit test

# E2E tests - refer to: test/e2e/AGENTS.md

# Code Quality
yarn lint             # Lint everything
yarn lint:css         # Lint CSS
yarn lint:js          # Lint JavaScript
yarn reformat-files   # Fix formatting with Prettier
yarn typecheck-client # Type-check client
```

## Conventions

- Do NOT add any verbose code comments that narrate what the change does or why it was made (e.g. `// Added this to fix X`, `// Changed from Y to Z`, restating the code in prose). Such explanation belongs in the PR description, not the source. Only keep comments that a future reader genuinely needs — non-obvious rationale, gotchas, links to context — and match the comment density and style of the surrounding code.

## Pre-PR checks

Before pushing a branch or running `gh pr create`, run the type-check that CI will run. PRs touching `client/` may fail the `type_check_client` CI check after opening, so verify locally first:

```bash
yarn               # Install dependencies first if you haven't already
yarn typecheck-client
```

If it fails, fix the type errors at the source — do not silence them with `// @ts-expect-error`, `// @ts-ignore`, or `as any` unless you can justify it in the PR description. Other CI type-checks worth running when relevant: `yarn typecheck-packages`, `yarn typecheck-apps`.

## Creating Pull Requests

- Create PRs as draft. Follow the template in .github/PULL_REQUEST_TEMPLATE.md.
- Follow the branch naming conventions in docs/git-workflow.md.
- In the PR description:
  - Use Linear issue IDs (e.g., `LIN-123`) instead of full Linear URLs.
  - Avoid mentioning people's names.
  - Do not link to wordpress.com URLs.
  - Include all checklist items from .github/PULL_REQUEST_TEMPLATE.md. Only mark items as completed (`[x]`) if they actually apply; leave inapplicable items unchecked (`[ ]`).
