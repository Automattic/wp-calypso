# Dark mode → WordPress Design System (`@wordpress/theme`) migration

> Status: **exploration / foundation landed.** This document is the step-by-step
> plan for replacing Calypso's bespoke dark-mode engine with the official
> WordPress Design System (WPDS), and it records what the accompanying draft PR
> already changes versus what remains.

## 1. Why

The current dark mode is a **proprietary, hand-rolled system**:

- A 800+ line SCSS palette engine (`client/lib/color-scheme/dark-theme.scss`)
  generates color ramps with `color-mix()` and re-points Calypso's
  `--dashboard-*`, `--color-*` and `--wp-components-*` variables at them.
- Activation is a `data-theme="light|dark|system"` attribute written onto
  `<html>`, with every surface duplicating `:root[data-theme="dark"]` +
  `@media (prefers-color-scheme: dark)` selectors (the `when-dark-theme` mixin
  and per-surface `*-dark-theme.scss` / `*-dark-mode.scss` override sheets).
- Each `@wordpress/components` quirk is patched by a bespoke override mixin
  (`-primary-button`, `-dataviews`, `-popover`, `-modal`, …).

This is expensive to maintain, drifts from WordPress core, and has to be
re-derived for every new component.

**Target:** the official, themeable design system.

- `@wordpress/theme` ships the **WPDS design tokens** (`--wpds-*` CSS custom
  properties) and a `ThemeProvider` React component that **regenerates those
  tokens for the active light/dark mode at runtime** from a background seed
  color. No hand-rolled ramps, no `data-theme` selectors — dark is simply a
  different set of token values within the provider's DOM subtree.
- `@wordpress/ui` is the companion component library built **on the same WPDS
  tokens out of the box**, so adopting it gives us themable components for free.
- The `ThemeProvider` also remaps the legacy `--wp-components-color-*` and
  `--wp-admin-theme-color` variables, so most existing `@wordpress/components`
  follow the theme automatically with zero per-component overrides.

## 2. Key architectural difference (read this first)

The old system is **selector-driven**: "if `html[data-theme=dark]`, apply these
overrides." WPDS is **token-value-driven**: the `ThemeProvider` sets different
`--wpds-*` values; components that read those tokens just work. **There is no
"is dark" selector in WPDS.**

Consequence: the migration's real work is *moving components onto WPDS tokens /
`@wordpress/ui`* so they stop needing dark-specific override blocks at all. Every
`when-dark-theme { … }` block and every `*-dark-*.scss` mixin is a unit of debt
to delete, not to port.

## 3. The bridge strategy (how we migrate incrementally without a big-bang)

Two transitional artifacts let surfaces migrate one at a time while everything
keeps working:

1. **`wpds-theme.tsx`** — unlocks the private `ThemeProvider` (sanctioned for
   this migration), resolves `light | dark | system` to a concrete mode (tracking
   the OS preference live), and mounts `<ThemeProvider isRoot color={{ bg }}>`.
   This is now the **source of truth** for theming.
2. **`_wpds-bridge.scss`** — the lean replacement for the palette engine. A single
   `color-scheme-wpds-bridge` mixin maps Calypso's legacy `--dashboard-*` /
   `--color-*` variables onto `--wpds-*` semantic tokens, mode-agnostically (the
   token values already encode the mode). Surfaces include this once instead of
   the 800-line engine, then peel lines off it as components adopt `--wpds-*`
   directly.
3. **`data-theme="light|dark"` bridge attribute** — still written by the provider,
   but now only ever the *resolved* value. It exists solely so not-yet-migrated
   SCSS (`when-dark-theme`, surface sheets) keeps matching. It is deleted in the
   final phase.

## 4. What the accompanying draft PR already changes

- ➕ `wpds-theme.tsx`: private-API unlock + `WPDSThemeProvider` + `useResolvedColorScheme`.
- ✏️ `shared.tsx`: wraps the app in `WPDSThemeProvider`; `data-theme` is now the
  *resolved* light/dark bridge value (system resolved in JS, not in CSS).
- ➕ `_wpds-bridge.scss`: the forward-looking variable bridge.
- ⚠️ `dark-theme.scss` and the `when-dark-theme` mixin: marked **deprecated**; the
  `when-dark-theme` system/`prefers-color-scheme` branch removed (resolution now
  happens in JS).
- ✏️ `index.tsx`: exports the new WPDS helpers.
- ✏️ tests updated for the resolved-`data-theme` semantics.

The legacy engine and per-surface sheets are intentionally **left in place** so
the app still builds and current dark-mode surfaces keep rendering. They are
removed surface-by-surface in the phases below. Doing all ~80 deeply-coupled
files in one commit would be unreviewable and unbuildable — exactly what this
exploration is meant to avoid.

## 5. Step-by-step migration plan

### Phase 0 — Build & tooling (prerequisite)

1. Ensure `@wordpress/theme/design-tokens.css` is loaded **app-wide** (not just in
   the dashboard `style.scss`). Add the import to the classic Calypso global
   stylesheet entry so Reader/Themes also get base token values.
2. Wire the WPDS token-fallback build plugins so `var(--wpds-*)` references get
   fallbacks even before the stylesheet loads:
   - PostCSS: `@wordpress/theme/postcss-plugins/postcss-ds-token-fallbacks`
   - JS/TS (webpack/esbuild): `@wordpress/theme/esbuild-plugins/esbuild-ds-token-fallbacks`
3. Add the WPDS Stylelint plugins (`no-unknown-ds-tokens`,
   `no-setting-wpds-custom-properties`, `no-token-fallback-values`) to the
   Stylelint config to enforce correct token usage going forward.
4. Verify the private-API unlock resolves a **single** `@wordpress/private-apis`
   instance in the webpack bundle (dedupe), otherwise `unlock()` cannot read the
   lock. Add a dedupe/resolve alias if multiple copies appear.
5. Confirm `@wordpress/style-runtime` (used by `ThemeProvider`) is bundled and
   that the provider's injected `<style>` works in SSR/loading-screen contexts.

### Phase 1 — Foundation (DONE in this PR)

- Mount `WPDSThemeProvider`, resolve scheme in JS, ship the bridge mixin.

### Phase 2 — Dashboard surface

1. In `client/dashboard/app/style.scss`, replace the `:root[data-theme='dark']`
   block (which `@include dashboard-dark-theme`) with an **unconditional**
   `@include color-scheme-wpds-bridge` at `:root`.
2. In `client/dashboard/app/_dark-theme.scss`, delete every mixin that only
   re-derived tokens or patched `--wp-components-*` (`-tokens`,
   `-calypso-properties`, `-palettes`, `-primary-button`, `-card`,
   `-form-controls`, `-popover`, `-modal`, `-summary-button`, `-dataviews`,
   `-site-icon`) — these are now handled by the provider + bridge. Keep only the
   genuinely Calypso-markup-specific overrides until those components move to
   `@wordpress/ui`.
3. Convert dashboard charts (`chart-theme.ts`) to read WPDS tokens.
4. Visual-regression the dashboard in light/dark/system; delete dead overrides.

### Phase 3 — Reader surface

1. `client/reader/color-scheme/dark-mode.scss`: replace
   `color-scheme-dark-theme-calypso-overrides` with `color-scheme-wpds-bridge`.
2. Migrate the ~25 Reader block/style sheets that use `when-dark-theme` (see file
   list below) to consume `--wpds-*` tokens, deleting each `when-dark-theme`
   block as it is converted.
3. Replace remaining `--studio-*` / `--color-neutral-*` ramp-index references
   (e.g. `--studio-blue-70`) with semantic WPDS tokens.

### Phase 4 — Themes showcase surface

1. `client/my-sites/themes/_dark-mode.scss`: same swap to the bridge.
2. This sheet is the most ramp-coupled (`color-palette-alias`,
   `--studio-blue-60/70/80`, `--color-accent-80`, `--color-neutral-50/70`).
   Replace those with semantic tokens; where a numeric ramp is genuinely needed,
   pull from the WPDS primitive tokens rather than the generated Calypso ramp.

### Phase 5 — Adopt `@wordpress/ui`

1. Introduce `@wordpress/ui` for new/rebuilt UI; load its isolation styles
   (`.root { isolation: isolate; }`, `body { position: relative; }` per its
   README) and call `useEnableWpCompatOverlaySlot()` once at the app root since we
   bundle `@wordpress/components` alongside it.
2. Replace bespoke components that exist only to be themed (badges, cards,
   panels) with their `@wordpress/ui` equivalents, removing the matching dark
   overrides.

### Phase 6 — Eradication & cleanup

1. Delete `client/lib/color-scheme/dark-theme.scss` (the engine) once no sheet
   imports it.
2. Delete the `when-dark-theme` mixin
   (`client/assets/stylesheets/shared/mixins/_dark-theme.scss`) once no consumer
   remains.
3. Remove the `data-theme` bridge attribute write from `shared.tsx`; drop
   `_wpds-bridge.scss` lines/the file as the last legacy variables disappear.
4. Re-evaluate the `dark-mode` / `colorScheme` / `darkMode` feature flags in
   `config/*.json` and `client/dashboard/app-*/index.tsx`: the WPDS path can be
   on by default; keep a flag only if a staged rollout is desired.
5. Update `client/dashboard/AGENTS.md` and `client/reader/AGENTS.md`, which
   currently document the `when-dark-theme`/`dark-theme` conventions.

## 6. File inventory (the eradication checklist)

**Core library** — `client/lib/color-scheme/`: `dark-theme.scss` (delete),
`shared.tsx` (drop bridge attr), `wpds-theme.tsx` (keep), `_wpds-bridge.scss`
(shrink → delete), `query-provider.tsx` / `classic-provider.tsx` /
`with-color-scheme.tsx` (unchanged API).

**Shared mixin** — `client/assets/stylesheets/shared/mixins/_dark-theme.scss`
(delete).

**Surface sheets** — `client/dashboard/app/_dark-theme.scss`,
`client/dashboard/app/style.scss`, `client/reader/color-scheme/dark-mode.scss`,
`client/my-sites/themes/_dark-mode.scss`, `client/dashboard/app/chart-theme.ts`.

**`when-dark-theme` consumers (~38)** — dashboard: `sites/add-new-site`,
`me/billing-purchases` (+ `payment-methods/credit-card-fields`),
`components/logs-activity/activity-event`, `components/offer-card`,
`sites/site-launch-celebration-modal`, `sites/settings-ai-tools`,
`sites/deployments-list/deployment-logs`, `app/snackbars`; reader/blocks:
`blocks/reader-post-actions`, `blocks/reader-site-subscription`,
`blocks/reader-post-card`, `blocks/comments/{form,post-comment}`,
`blocks/reader-full-post` (+ `post-navigation`, `link-preview`),
`blocks/reader-post-options-menu`, `reader/new-subscription/.../add-subscription-form`,
`reader/stream`, `reader/site-subscriptions-manager`,
`reader/list/.../list-header`, `reader/sites-list`,
`reader/sidebar` (+ `reader-sidebar-tags/add-tags-form`, `reader-sidebar-recent`,
`social`), `reader/user-profile/.../top-sites`, `components/notice`,
`reader/components/{header,mobile-header,quick-post}`,
`reader/social/{composer,composer-media}`, `reader/search-stream`.

**Config / flags** — `config/dashboard-*.json`, `config/{development,production,
stage,wpcalypso,horizon}.json`, `client/dashboard/app-dotcom/index.tsx`,
`client/dashboard/app-ciab/index.tsx`, `client/dashboard/app/context.tsx`.

**Docs** — `client/dashboard/AGENTS.md`, `client/reader/AGENTS.md`.

## 7. Risks / open questions

- **Visual parity.** WPDS-generated dark ramps won't be pixel-identical to the
  hand-tuned values. Expect a design review per surface.
- **`color-scheme: system`.** WPDS picks light/dark from the seed; we resolve
  `system` in JS and re-seed. Confirm this is acceptable vs. a pure-CSS
  `light-dark()` approach.
- **Private API.** `ThemeProvider` is behind `privateApis`; the unlock is gated to
  `wpds-theme.tsx`. Track the package for a public export and the consent-string
  changes called out by `@wordpress/private-apis`.
- **Provider wrapper element.** `ThemeProvider` renders a `display: contents` div;
  verify no layout/`:root`-height assumptions break, especially under the Node
  loading screen.
- **Bundle dedupe.** A duplicated `@wordpress/private-apis` would break `unlock()`.
