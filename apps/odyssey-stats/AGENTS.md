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

Odyssey only owns the `#wpcom` subtree of a wp-admin page (wp-admin chrome is a sibling under the same `<body>`), so `webpack.config.js` runs a `postcss-prefix-selector` step scoping first-party component styles to `.jp-stats-dashboard`, the WP-Admin dashboard widget's own mount point (`.jp-stats-widget`), and known portal roots (`.color-scheme`, `.ReactModalPortal`, `[data-base-ui-portal]`, `[data-wp-compat-overlay-slot]`, `.components-modal__screen-overlay` for `@wordpress/components` `Modal`). Two lists there need updating as the app evolves:

- **Prefix target list** — add a new mount point or portal root if a component renders under a wrapper not already listed (e.g. a new standalone entry point, or a component that renders through a new `Popover`/`Dialog`/`Tooltip` library).
- **`exclude` list** — add a pattern if a selector legitimately targets the real `<html>`/`<body>`/`:root` (RTL flags, `:lang()`, scroll-lock, etc.); prefixing those makes them permanently dead instead of just scoped.

After changing either list, do a production build and grep the compiled CSS for the affected class to confirm it's scoped (or intentionally left unscoped), not silently dead.

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
