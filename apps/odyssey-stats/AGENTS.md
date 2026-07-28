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

Odyssey only owns the `#wpcom` subtree of a wp-admin page, so `webpack.config.js` scopes first-party CSS via `postcss-prefix-selector` to known mount points and portal roots. These lists in `webpack-css-scope.js` need updating as the app evolves:

- **`prefix`** — add a new mount point or portal root when a component renders under a wrapper not already listed.
- **`exclude`** — add a pattern for a selector that legitimately targets `<html>`/`<body>`/`:root`, or a mount point's own root element; prefixing those makes them permanently dead instead of scoped.
- **`entryPointRoots`** / **`portalRoots`** — every `prefix` root must go in exactly one. `entryPointRoots` is for standalone mounts never nested inside another root; `portalRoots` for roots that legitimately nest _inside_ one (e.g. `.color-scheme.is-light .masterbar`). Classify by checking where the root actually attaches in source (its `appendChild`/portal target, e.g. `root-child.tsx`), not by guessing from usage — a wrong `portalRoots` classification produces dead CSS the automated check won't catch, since that's exactly the case it treats as legitimate.

`ignoreFiles` matches on the file being compiled, not on which `.scss` file did the importing. A `@import "foo.css"` (explicit `.css` extension) isn't inlined by Sass — it passes straight through, so css-loader resolves and compiles it as its own separate unit rooted at its real `node_modules` path, even if the `.scss` file that imported it is itself unscoped. That's how our bundled copy of `@wordpress/components/build-style/style.css` (imported from `client/assets/stylesheets/style.scss`) ends up compiled separately, with `node_modules` as its own `from` — which is why it needs its own carve-out rather than inheriting `style.scss`'s `ignoreFiles` entry.

Left unscoped, that vendor CSS collides with wp-admin's own instances of the same components — e.g. the command palette, also a `@wordpress/components` Modal built from the same shared code Odyssey's JS externalizes to (`wp.components.Modal`, via `DependencyExtractionWebpackPlugin`). But it can't share `prefix` above: `.components-modal__screen-overlay`/`.components-popover__fallback-container` are the shared wrapper classes every Modal/Popover gets, ours and core's alike, so requiring one of them as an ancestor doesn't actually distinguish "our modal" from "core's modal" — it's a no-op restriction for the vendor CSS's own bare selectors (`.components-modal__frame`, `.components-modal__header`, ...), unlike when they anchor Odyssey's own compound-scoped overrides elsewhere (e.g. `.stats-utm-builder__overlay .components-modal__header`, which stays specific because of the extra class).

So `webpack-css-scope.js` exports a second, narrower `vendorPrefix` (same roots, minus those two) applied only to that one file via a second `prefixSelectorPlugin` instance in `webpack.config.js`, using `includeFiles: vendorIncludeFiles` instead of `ignoreFiles`. It anchors on `.is-odyssey-stats` instead — a marker our own Modal instances add via the `overlayClassName` prop (see `stats-upsell-modal`, `stats-module-utm-builder`, `feedback/modal`), which core never emits. **Any new `@wordpress/components` `Modal` (or similar portaled component) Odyssey renders must pass `.is-odyssey-stats` via `overlayClassName`/equivalent, or the vendor CSS's own base styling won't apply to it** — it'll silently look unstyled rather than leaking onto core's UI, which is the safe failure direction but still worth avoiding.

`yarn verify:css-scope` (runs as part of `teamcity:build-app`) builds and checks the compiled CSS against both `prefix` and `vendorPrefix` for the same failure — a root nested under a `:where(...)` group it's already a member of — and fails loudly if any root in either is left unclassified. See `bin/verify-css-scope.js`.

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
