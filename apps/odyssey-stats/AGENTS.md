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

The `:where(prefix)` string gets repeated on every scoped rule (not deduped), so it's normal for it to make up roughly half the raw compiled CSS — that's not a bug. Gzip compresses the repetition down to a few KB, so the real network cost is small (the whole CSS bundle is ~68 KiB gzipped) and CSS isn't in `size-limit`'s budget. Don't "fix" this by shrinking the `prefix` list.

#### @wordpress/components' base CSS

`webpack.config.js` aliases `@wordpress/components/build-style/style.css` to an empty stylesheet, so Odyssey does **not** bundle it. Odyssey's JS already externalizes `@wordpress/components` to the page's own `wp.components` (via `DependencyExtractionWebpackPlugin`), and `jetpack-stats-admin` declares the matching `wp-components` stylesheet as a dependency of Odyssey's own — so wp-admin supplies both halves, correctly paired and correctly ordered.

Bundling Calypso's copy as well would put two independently-versioned copies of the same unnamespaced class names (`.components-modal__frame`, `.components-button`, ...) on one page, colliding with wp-admin's own instances of those components — that's what made WP 7.0's command palette render with the wrong padding and off-centre (STATS-251). Scoping that copy isn't a real fix either: `.components-modal__screen-overlay`/`.components-popover__fallback-container` sit on the shared wrapper every Modal/Popover gets, ours and core's alike, so they can't distinguish "our modal" from "core's".

The alias is scoped to this build only. `client/assets/stylesheets/style.scss` still imports that vendor CSS for Calypso, Blaze Dashboard, Stepper and friends — they're standalone SPAs with no wp-admin to inherit it from, so removing it there would break them.

**If Odyssey ever needs a `@wordpress/components` style that wp-admin doesn't provide, add it as first-party SCSS — don't un-stub the alias.**

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
