# Self-hosted Stats should respect the admin colour scheme (STATS-322)

## Goal

Odyssey Stats (Calypso Stats embedded in wp-admin) currently renders in Jetpack
green regardless of the user's WordPress admin colour scheme. It should follow
that scheme instead.

## Background

Two independent mechanisms pin Odyssey to green. Both must change; fixing either
alone leaves the colour unchanged.

1. **`apps/odyssey-stats/src/styles/variables.scss:16-53`** defines
   `@mixin jetpack-theme-for-odyssey-stats`, which maps `--color-primary-*` to
   the Jetpack green studio scale and then maps `--color-accent-*`,
   `--theme-highlight-color` and `--wp-admin-theme-color` onto that scale.

2. **`client/my-sites/stats/hooks/use-wp-admin-theme.tsx:14-16`** short-circuits
   every Jetpack site — self-hosted and Atomic — to the `is-jetpack` class:

   ```ts
   // All Jetpack sites should be in Jetpack colors, including Atomic sites.
   if ( isSiteJetpack ) {
       return 'is-jetpack';
   }
   ```

`apps/odyssey-stats/src/styles/theme.scss:3-6` applies the mixin to **both**
`:root` and `.color-scheme.is-jetpack`. So removing the mixin's declarations
alone would not work: the hook still yields `is-jetpack`, and that selector
re-applies green. Conversely, changing only the hook would leave the `:root`
include setting green globally.

This corrects the scoping stated in the issue's own comment, which asserted the
`variables.scss` removal was sufficient.

### What already exists

`@automattic/calypso-color-schemes` ships all nine WP core admin schemes —
`fresh`, `light`, `modern`, `blue`, `midnight`, `sunrise`, `ectoplasm`, `ocean`,
`coffee` — each defining a complete `--color-primary-*` scale (15 declarations)
and a complete `--color-accent-*` scale (15 declarations), plus
`--theme-highlight-color`
and `--wp-admin-theme-color`. `_global.scss:33-47` supplies fallbacks. The hook's
existing simple-site path already maps `admin-color-<x>` to `is-<x>`, matching
those class names exactly.

PR #112589 (merged) already routed Stats' interactive elements — link colours,
focus rings, hover backgrounds, selected-state borders, the UTM builder outline —
through `--color-accent`. Those follow the admin scheme automatically once the
override is gone, with no component-level CSS changes.

## Scope decisions

| Decision | Choice | Rationale |
|---|---|---|
| Which sites | All Jetpack sites, including Atomic | Both run in wp-admin with a real admin colour scheme; splitting them would need a new Atomic check inside a hook that deliberately avoids Redux selectors. |
| Which scales | Both `--color-primary-*` and `--color-accent-*` follow the admin theme | Scheme files define both in full, so nothing falls back to unset. |
| Blast radius | Stats surfaces only | Other Jetpack wp-admin views can be updated separately. This is why the `:root` include is removed rather than retained. |
| Dashboard widget | Themed in this change | It sits on the wp-admin dashboard where the scheme is most visible; leaving it green beside a themed dashboard would be visibly inconsistent. |

## Design

### 1. `client/my-sites/stats/hooks/use-wp-admin-theme.tsx`

Remove the `isSiteJetpack` branch, leaving a single path: return `null` when not
in wp-admin, otherwise read the `admin-color-*` body class and convert it to a
Calypso `is-<scheme>` class.

The `isSiteJetpack` parameter becomes unused and is removed from the signature.
Three call sites update accordingly:

- `client/my-sites/stats/components/stats-main/index.tsx:113`
- `client/components/stats-interval-dropdown/index.jsx:122`
- `apps/odyssey-stats/src/components/root-child.tsx:20`

At each, check whether the local `isSiteJetpack` value is still used for anything
else before removing its derivation — several of these components use it for
unrelated logic.

### 2. `apps/odyssey-stats/src/styles/variables.scss`

Delete lines 19-52 from the mixin: the `--color-primary-*` scale, the
`--color-accent-*` scale, `--theme-highlight-color`, `--color-primary`,
`--color-accent`, `--wp-admin-theme-color`, and `--geo-chart-color-light` /
`--geo-chart-color-dark`.

The `--geo-chart-color-*` pair is dead already — referenced nowhere in `apps/`,
`client/` or `packages/`. The geochart reads `--color-accent-5` and
`--color-accent` directly via `getComputedStyle` on `main.stats-main`
(`client/my-sites/stats/geochart/index.jsx:384-387`), which the scheme class
supplies.

`--jetpack-white-off: #f9f9f6` (line 17) is retained — it is a static surface
colour, not theming, and has two live consumers:
`apps/odyssey-stats/src/styles/wp-admin.scss:94` and
`apps/odyssey-stats/src/widget/index.scss:63`.

With only that declaration left, the mixin is no longer a theme. Rename it to
`odyssey-stats-base-vars`, updating both include sites
(`theme.scss` and `scoped-theme-for-widget.scss`).

### 3. `apps/odyssey-stats/src/styles/theme.scss`

Remove the `:root` include. It is emitted unscoped — `app.scss` is in the postcss
`ignoreFiles` list (`webpack.config.js:118`) and `:root` is in the prefix
plugin's `exclude` list (`:132`) — so it currently sets Jetpack green, including
`--wp-admin-theme-color`, on the document root of the entire wp-admin page. That
both defeats the goal and exceeds the Stats-only scope.

Remove the `.color-scheme.is-jetpack` block. The hook was its only producer and
`theme.scss:4` is its only definition repo-wide, so it becomes dead code.

Retain the `--wp-components-color-accent: var(--color-accent)` mapping on
`.stats-main.color-scheme` and `.popover.color-scheme`; it resolves to the admin
scheme once the override is gone.

`--jetpack-white-off` needs a home on a Stats-scoped selector so
`wp-admin.scss:94` keeps resolving. Apply the renamed base mixin to
`.jp-stats-dashboard`.

### 4. Dashboard widget

The widget renders `.stats-widget-content` (`widget/index.tsx:38`) with no
colour-scheme class, and `widget-base.scss:6` imports
`calypso-color-schemes-root`, which pulls in only `shared/colors` and the default
scheme — no `.color-scheme.is-*` rules. Its colours come solely from the mixin
via `scoped-theme-for-widget.scss`, so stripping the mixin would leave
`mini-chart.scss:3`'s `--color-primary-60` unset.

Three changes:

- `widget/index.tsx:38` — add `color-scheme` and the `useWPAdminTheme` result to
  the class list.
- `widget-base.scss:6` — import `calypso-color-schemes` instead of
  `calypso-color-schemes-root`, so the per-scheme rules exist.
- `scoped-theme-for-widget.scss` — include the renamed base mixin only.

Bundle size is not a constraint here: `.size-limit.js` gates `dist/build.min.js`
and `dist/widget-loader.min.js` only, both JavaScript.

## Risks to verify during implementation

- **Unscoped consumers.** Removing the `:root` include means any element inside
  `.jp-stats-dashboard` that reads an accent or primary variable but sits outside
  a `.color-scheme` element loses its value. Grep `wp-admin.scss` and the Stats
  component styles for `--color-accent` / `--color-primary` reads and confirm
  each is covered by `.stats-main.color-scheme`, `.popover.color-scheme`, or a
  `root-child` portal (`root-child.tsx:20-25` sets the class on portal roots).
- **Missing `admin-color-*` class.** The hook returns `null`, no scheme class is
  applied, and styling falls through to `_default.scss` / `_global.scss`. WP core
  always sets the body class, so this is a degenerate case — confirm it degrades
  to something sane rather than to unset variables.
- **Geochart timing.** `geochart/index.jsx:377-387` reads its colours through
  `getComputedStyle` at render time rather than via CSS, so it will not react to
  a scheme change without a re-render. Acceptable — the admin scheme does not
  change without a page load — but verify the map picks up the right colours on
  first paint.
- **Atomic sites change appearance too.** In scope and intended; call it out in
  the PR body so reviewers are not surprised.

## Verification

Static checks: `yarn typecheck-client`, `yarn lint:js` and `yarn lint:css` on the
touched files, and `yarn test-client --findRelatedTests` for the hook and its
call sites.

Static checks are not sufficient for a colour change. Browser verification: build
Odyssey against a Jurassic Ninja site, switch the admin colour scheme across at
least `fresh`, `midnight` and `ectoplasm`, and confirm on each:

- Stats dashboard — link colours, focus rings, hover and selected states
- A popover surface — date-range picker or an interval dropdown
- The geochart gradient
- The wp-admin dashboard widget, including mini-chart bars
- wp-admin chrome *outside* Stats is unaffected — specifically that
  `--wp-admin-theme-color` is no longer clobbered page-wide

Capture before/after screenshots for the PR.
