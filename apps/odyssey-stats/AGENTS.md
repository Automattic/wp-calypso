# Odyssey Stats

Calypso Stats served within wp-admin via the Jetpack plugin. Assets are deployed to `widgets.wp.com/odyssey-stats/v1/` and consumed by the [`stats-admin`](https://github.com/Automattic/jetpack/tree/trunk/projects/packages/stats-admin) Jetpack package.

## Directory Structure

```
src/
├── components/       # App-specific components (layout, headers, query wrappers)
├── hooks/            # TanStack Query hooks for stats data fetching
├── lib/              # Core utilities (config, API, selectors, locale)
├── page-middleware/  # page.js integration with React context
├── widget/           # Lightweight dashboard widget components
├── app.tsx           # Main app entry point
├── widget-loader.ts  # Widget entry point (8 KiB budget)
└── routes.ts         # page.js route definitions
```

## Tech Stack

- React 18 + TypeScript
- Redux + TanStack Query (dual state management)
- page.js with hashbang (`#!`) routing for Jetpack compatibility
- Custom config system (`ConfigApi` class, `window.configData`)

## Commands

```bash
yarn build                  # Production build + translations
yarn dev                    # Development build with watch
yarn dev --sync             # Dev build + rsync to sandbox (requires SSH alias)
yarn test:js                # Run unit tests
yarn test:size              # Check bundle size limits
yarn show-stats             # Build with webpack stats output
```

## Entry Points

- **`app.tsx`**: Full stats dashboard application
- **`widget-loader.ts`**: Lightweight widget for wp-admin dashboard

## Bundle Size Limits

Enforced via `.size-limit.js`:
- `build.min.js`: 495 KiB
- `widget-loader.min.js`: 8 KiB

## Dependencies on Calypso

Heavy reliance on shared Calypso code:
- `calypso/my-sites/stats/*` — stats pages, components, utilities
- `calypso/state/stats/*` — Redux state, selectors, actions
- `calypso/state/sites/*` — site data reducers
- `calypso/components/*` — shared UI components

Webpack module replacement is used to swap Calypso internals with Odyssey-specific implementations.

## Architectural Decisions

### Config System

The config must be initialized before any other imports:
```typescript
// app.tsx - init-app-config MUST be the first import
import './lib/init-app-config';
```

Config data comes from `window.configData` (injected by Jetpack), not `@automattic/calypso-config`.

### Hashbang Routing

Uses `page.js` with hashbang mode (`#!/stats/day/123`) because Odyssey runs inside wp-admin which controls the main URL. Jetpack intercepts anchor clicks and converts them to hashbangs.

### API Routing

All API calls route through Jetpack's REST API (`/wp-json/jetpack/v4/stats/...`) instead of `public-api.wordpress.com`. The `getApi()` helper determines which API client to use based on environment.

### Production Config

Odyssey Stats always uses Calypso production config, not development config.

## Common Pitfalls

### Config Initialization Order

`init-app-config` must be imported before any package that might reference `@automattic/calypso-config`. The eslint disable comment is intentional.

### Jetpack vs WP.com API Divergence

Some endpoints behave differently between Jetpack REST API and WP.com API. Check `getApi()` usage and ensure compatibility with both paths.

### Bundle Size

Stay within the 495 KiB app and 8 KiB widget limits. The widget is intentionally minimal to load quickly on wp-admin dashboard.

### Redux/Query Interop

The app uses both Redux (legacy) and TanStack Query (new). New data fetching should prefer Query hooks in `src/hooks/`. Redux is used for site/user state from Calypso.

### Gridicon SVG Loading

`Gridicon` from `@automattic/components` uses SVG sprites that don't work from CDN. The app uses `packages/components/src/gridicon/no-asset.tsx` instead, with Jetpack loading sprites separately.

## Development Setup

### Option 1: Local Development (Faster)

Requires both Jetpack and Calypso dev environments with tunneling:
```bash
cd apps/odyssey-stats
STATS_PACKAGE_PATH=/path/to/jetpack/projects/packages/stats-admin yarn dev
```

### Option 2: Sandbox Testing (Production-like)

1. Point `widgets.wp.com` to your sandbox in `/etc/hosts`
2. Wait for TeamCity build on your PR
3. SSH to sandbox: `bin/install-plugin.sh odyssey-stats your-branch-name`

### Option 3: Direct Sync to Sandbox

```bash
cd apps/odyssey-stats
yarn dev --sync
```
Requires `wpcom-sandbox` SSH alias in `~/.ssh/config`.

## Deployment

See [Fieldguide: Odyssey Stats](https://fieldguide.automattic.com/odyssey-stats/) for full deployment instructions. Key steps:

1. Check Jetpack compatibility (new endpoints, config, initial state)
2. SSH to sandbox and run: `bin/install-plugin.sh odyssey-stats trunk --release`
3. Verify on sandbox with `widgets.wp.com` pointed to it
4. Merge build PR and deploy to wpcom

Changes reach users immediately upon deployment (independent of Jetpack release cycle).
