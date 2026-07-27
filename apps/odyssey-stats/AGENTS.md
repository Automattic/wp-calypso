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

Odyssey only owns the `#wpcom` subtree of a wp-admin page, so `webpack.config.js` scopes first-party CSS via `postcss-prefix-selector` to known mount points and portal roots. Four lists in `webpack-css-scope.js` need updating as the app evolves:

- **`prefix`** — add a new mount point or portal root when a component renders under a wrapper not already listed.
- **`exclude`** — add a pattern for a selector that legitimately targets `<html>`/`<body>`/`:root`, or a mount point's own root element; prefixing those makes them permanently dead instead of scoped.
- **`entryPointRoots`** / **`portalRoots`** — every `prefix` root must go in exactly one. `entryPointRoots` is for standalone mounts never nested inside another root; `portalRoots` for roots that legitimately nest _inside_ one (e.g. `.color-scheme.is-light .masterbar`). Classify by checking where the root actually attaches in source (its `appendChild`/portal target, e.g. `root-child.tsx`), not by guessing from usage — a wrong `portalRoots` classification produces dead CSS the automated check won't catch, since that's exactly the case it treats as legitimate.

`yarn verify:css-scope` (runs as part of `teamcity:build-app`) builds and checks the compiled CSS for exactly this failure — a root nested under a `:where(...)` group it's already a member of — and fails loudly if any `prefix` root is left unclassified. See `bin/verify-css-scope.js`.

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
