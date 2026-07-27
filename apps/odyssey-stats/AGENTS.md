# Odyssey Stats

Calypso Stats embedded in wp-admin via Jetpack. Shares code heavily with `client/my-sites/stats/`.

## Directory Structure

```
src/
├── components/       # App-specific components (layout, headers, query wrappers)
├── hooks/            # TanStack Query hooks for stats data
├── lib/              # Config, API helpers, selectors
├── page-middleware/  # page.js + React integration
├── widget/           # Lightweight wp-admin dashboard widget
├── app.tsx           # Main entry point
├── widget-loader.ts  # Widget entry point
└── routes.ts         # Route definitions
```

## Commands

```bash
yarn build        # Production build
yarn dev          # Development build
yarn test:js      # Unit tests
yarn test:size    # Bundle size check
```

## Critical Constraints

### Config Initialization Order

`init-app-config` MUST be the first import in `app.tsx`:

```typescript
// The eslint-disable is intentional - do not reorder
import './lib/init-app-config';
```

### Bundle Size Limits

- `build.min.js`: 545 KiB max
- `widget-loader.min.js`: 8 KiB max

Run `yarn test:size` to verify.

### Hashbang Routing

Routes use `#!/path` format (not `/path`) because app runs inside wp-admin. All internal links must work with hashbang routing.

### API Differences

Odyssey routes API calls through Jetpack REST API, not `public-api.wordpress.com`. Use `getApi()` helper and test both Jetpack and WP.com Simple contexts.

### CSS Scoping

Odyssey only owns the `#wpcom` subtree of a wp-admin page, so `webpack.config.js` scopes first-party CSS via `postcss-prefix-selector` to known mount points and portal roots. Two lists in `webpack-css-scope.js` need updating as the app evolves:

- **`prefix`** — add a new mount point or portal root when a component renders under a wrapper not already listed (check where it actually attaches in source — e.g. `root-child.tsx`'s `appendChild` target — not by guessing from usage).
- **`exclude`** — add a pattern for a selector that legitimately targets `<html>`/`<body>`/`:root`, or a mount point's own root element; prefixing those makes them permanently dead instead of scoped.

After changing either, do a production build and grep the compiled CSS for the affected class to confirm it's scoped (or intentionally left unscoped), not silently dead.

The `:where(prefix)` string gets repeated on every scoped rule (not deduped), so it's normal for it to make up roughly half the raw compiled CSS — that's not a bug. Gzip compresses the repetition down to a few KB, so the real network cost is small (the whole CSS bundle is ~84 KiB gzipped) and CSS isn't in `size-limit`'s budget. Don't "fix" this by shrinking the `prefix` list.

## Conventions

- New data fetching: use TanStack Query hooks in `src/hooks/`
- Redux: only for site/user state inherited from Calypso
- Config access: use `config()` from `./lib/config-api`, not `@automattic/calypso-config`
- Gridicons: use `packages/components/src/gridicon/no-asset.tsx` (CDN-safe)

## Common Mistakes

- Importing `@automattic/calypso-config` directly (use local config wrapper)
- Adding imports before `init-app-config`
- Exceeding bundle size limits
- Using regular links instead of hashbang-compatible navigation
- Not testing in both Jetpack and WP.com Simple environments
