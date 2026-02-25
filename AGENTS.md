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

- **Image Studio** (`packages/image-studio`) — AI-powered image editing and generation

## Development

```bash
# Setup
yarn install

# Build and start the dev server
yarn start

# Build and start the dev server for the Dashboard client only.
yarn start-dashboard
```

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
yarn lint           # Lint everything
yarn lint:css       # Lint CSS
yarn lint:js        # Lint JavaScript
yarn reformat-files # Fix formatting with Prettier
```

## Creating Pull Requests

- Create PRs as draft. Follow the template in .github/PULL_REQUEST_TEMPLATE.md.
- Follow the branch naming conventions in docs/git-workflow.md.
- In the PR description:
  - Use Linear issue IDs (e.g., `LIN-123`) instead of full Linear URLs.
  - Avoid mentioning people's names.
  - Do not link to wordpress.com URLs.
  - Include all checklist items from .github/PULL_REQUEST_TEMPLATE.md. Only mark items as completed (`[x]`) if they actually apply; leave inapplicable items unchecked (`[ ]`).

## Cursor Cloud specific instructions

### Hosts file

The entry `127.0.0.1 calypso.localhost` must exist in `/etc/hosts` for the dev server to work. The update script handles this automatically.

### Running the dev server

- `yarn start` builds both server and client bundles, then starts the Node.js Express server on port 3000. The first request triggers webpack dev middleware to compile client JS; this takes **3-5 minutes** on first load in the Cloud VM.
- `yarn start-dashboard` limits the build to the Dashboard entry points only. This builds faster but does **not** include the login form UI or other Calypso sections (those routes return server-rendered HTML without client-side JS).
- To run the server in the background: first run `yarn build`, then start `node build/server.js` as a background process. Set `NODE_OPTIONS='--max-old-space-size=8192'` to avoid OOM during webpack compilation.
- No local database or backend is needed; all data comes from the remote WordPress.com REST API.

### Linting individual files

Use `npx eslint --ext .js,.jsx,.ts,.tsx <file>` and `npx stylelint <file>` to lint specific files. The full `yarn lint` command can take a long time on the entire codebase.

### Running tests for specific directories

Use `yarn test-client <path>` to run tests from a specific directory. Test files live in `test/` subdirectories alongside the source, e.g. `client/components/notice/test/index.js`.
