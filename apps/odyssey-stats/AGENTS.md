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

Odyssey's JS externalizes `@wordpress/components` to the page's own `wp.components` (via `DependencyExtractionWebpackPlugin`), so the matching stylesheet should come from wp-admin too. **WP 7.0+ enqueues `wp-components` globally** for the command palette, so on those versions it's already on the page.

Shipping our own copy alongside it puts two independently-versioned copies of the same unnamespaced class names (`.components-modal__frame`, `.components-button`, …) on one page, colliding with wp-admin's own instances of those components. They genuinely disagree — core sets `.components-modal__frame` to `min-width: 350px; margin: auto`, ours to `320px` / `margin: 0` — which is what left WP 7.0's command palette off-centre with the wrong padding (STATS-251). Scoping our copy isn't a real fix either: `.components-modal__screen-overlay`/`.components-popover__fallback-container` sit on the shared wrapper every Modal/Popover gets, ours and core's alike, so they can't distinguish "our modal" from "core's".

So it's loaded **conditionally**, by `src/lib/load-wp-components-style.ts`, awaited in `AppBoot` before anything renders:

- **WP 7.0+** — wp-admin already provides it. Resolves immediately, no request.
- **below 7.0** — nothing provides it, so our copy is fetched as its own async chunk. Those versions have no command palette, so there's nothing for it to collide with.

Two `webpack.config.js` aliases make that work: `@wordpress/components/build-style/style.css` is stubbed to an empty file so `style.scss`'s unconditional import doesn't pull it into the main bundle, and `odyssey-wp-components-style` points at the real file for the dynamic `import()`. The stub is scoped to this build only — `client/assets/stylesheets/style.scss` still imports the vendor CSS for Calypso, Blaze Dashboard and Stepper, which are standalone SPAs with no wp-admin to inherit it from.

Note the widget entry (`widget-loader`) never imported `style.scss` — it uses `assets/stylesheets/vendor` — so it has always relied on wp-admin for this and is unaffected.

**If Odyssey ever needs a `@wordpress/components` style that wp-admin doesn't provide, add it as first-party SCSS — don't bundle the vendor file unconditionally.**

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
