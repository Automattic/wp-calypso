# A4A neutral color system

Status: proof of concept for design review. The initial PoC build and light/dark overview were verified. The system-only revision has focused provider coverage; fresh visual and full release verification remain pending.

## Activation and ownership

The A4A entry evaluates `dashboard/a4a-neutral-theme`. Development enables it; stage, horizon, and production leave it disabled. The flag enables the neutral palette and existing dark-mode support together. A4A supplies a fixed `system` color scheme to the shared provider. Other Dashboard variants retain their configuration.

`AppConfig.theme: 'neutral'` causes `boot()` to set `data-dashboard-theme="neutral"` on the document root before initializing the omnibar. This is independent from `data-theme="light|dark|system"`, owned by the existing color-scheme provider. Shared components use theme roles and capability flags rather than branching on the app name.

Palette and component bridges live in `app/_neutral-theme.scss`. The base mixin is included from `app/style.scss`; mode-specific overrides are composed at the end of the existing `dashboard-dark-theme` mixin. Existing shared dark-mode styling supplies canvas, surface, text, border, and component foundations. Dark overrides remain screen-only, so printing uses light colors.

A4A content pairs live in `app-a4a/style.scss`. They do not feed generic interaction tokens. No new component library, layout, or typography system is introduced.

## Interface roles

These are initial values pending rendered contrast and state verification, not an accessibility certification.

| Role / Dashboard variable suffix | Light | Dark |
| --- | --- | --- |
| Canvas (`__background-color`) | `#fcfcfc` | `#1e1e1e` |
| Surface (`-surface__background-color`) | `#ffffff` | `#2a2a2a` |
| Primary text (`__text-color`) | `#1e1e1e` | `#e0e0e0` |
| Secondary text (`__text-muted-color`) | `#606060` | `#bdbdbd` |
| Subtle border (`-surface__border-color`) | `#e0e0e0` | `#4a4a4a` |
| Field boundary (`-field__border-color`) | `#757575` | `#949494` |
| Hover (`-item-hover__background-color`) | `#f6f6f6` | `#323232` (surface/gray-200 mix) |
| Selected (`-item-selected__background-color`) | `#eeeeee` | `#3a3a3a` |
| Selected hover (`-item-selected-hover__background-color`) | `#e0e0e0` | `#4a4a4a` |
| Primary action (`-button-primary__background-color`) | `#1e1e1e` | `#e0e0e0` |
| Primary action hover (`-button-primary-hover__background-color`) | `#2f2f2f` | `#f0f0f0` |
| Primary action pressed (`-button-primary-active__background-color`) | `#000000` | `#ffffff` |
| Text on primary (`-button-primary__color`) | `#ffffff` | `#1e1e1e` |

Prefix the suffixes above with `--dashboard`. Existing WordPress gray primitives are reused where possible. Hover and pressed use existing primitives instead of adding near-identical shades from the original proposal.

Selected navigation uses its existing active link state, neutral fill, and stronger label/icon without a vertical marker. New sidebar-specific selected background, text, and hover roles have fallbacks to the existing WordPress.com styling. Keeping these roles separate avoids activating an existing menu variable in other variants unintentionally.

Prose links retain a persistent underline. Primary button focus gets a two-pixel gap; switches use the theme surface for their focus gap. Checkbox marks, radio dots, toggle thumbs, monochrome A4A shell logo, and launch-site labels consume their matching foreground roles rather than fixed white or black details.

## Compatibility mapping

| Consumer | Mapping | Default outside neutral theme |
| --- | --- | --- |
| `--wp-admin-theme-color` and darker/RGB variants | Neutral primary action states | Existing entry/provider values |
| `--wp-components-color-accent*` | Action states and paired on-fill text | Existing component values |
| WPDS long-form `background/foreground/stroke` interaction tokens | Neutral interface roles | Installed `@wordpress/theme` values |
| WPDS surface/text/focus tokens | Dashboard surface, text, field and focus roles | Existing theme values |
| Legacy `--color-text/surface/border/link/primary` | Corresponding Dashboard semantics | Existing Calypso values |
| Dark primary button element-level accent override | Optional Dashboard primary variables | Existing Studio blue fallbacks |
| Sidebar active style | Optional sidebar selected variables | Existing blue tint and foreground |
| Informational notices | Independent info foreground token | Existing admin accent fallback |
| Modern omnibar | Variables on `body:has(.omnibar)` so body portals inherit | Existing omnibar palette |
| Interim omnibar | Variables on its container | Existing masterbar palette |

Support-session omnibar colors are excluded from neutral overrides. Destructive actions retain their existing red treatment and paired light label. Status colors remain independent from interaction colors; dark informational/success/warning/error surfaces use the existing status foregrounds and mode-appropriate mixtures. Chart series and branded assets are not recolored by this change.

The alias names follow the installed Theme 1.0.0, Components 37, and DataViews 18 source. Short-form WPDS names must not be substituted without verifying the installed package contract.

## Brand content

The initial A4A-only content pairs use the two blues confirmed during the design research:

| Pair | Background token | Foreground token | Values in both modes |
| --- | --- | --- | --- |
| Bold | `--a4a-content-bold__background-color` | `--a4a-content-bold__color` | `#0240e4` / white |
| Soft | `--a4a-content-soft__background-color` | `--a4a-content-soft__color` | `#72b3ff` / `#1e1e1e` |

Always consume both halves of a pair on editorial surfaces. Do not alias the admin accent to a content background. Do not invert or dim official artwork for dark mode; adapt its surrounding card, caption, and controls. Product identities and status semantics retain their own colors.

These pairs establish the content contract; this change does not redesign resource covers or apply decorative backgrounds indiscriminately. Select the first real content applications with design review. Additional hues require confirmation against the brand source.

## System-driven mode

A4A sets `AppConfig.colorScheme: 'system'`. The existing provider applies `data-theme="system"`, and the existing `prefers-color-scheme: dark` media query switches the palette automatically, including OS changes while the page is open.

The provider's optional fixed `colorScheme` bypasses its account-preference query and prevents writes through its setter. A saved WordPress.com Light/Dark choice cannot override A4A's system mode, and opening A4A does not change that saved choice. The fixed scheme is ready immediately, without waiting for preferences to load. Other consumers omit the override and retain their existing preference behavior and default.

There is no A4A mode control, preference mutation, or mode-change analytics. The WordPress.com preferences page is unchanged.

## Rollback

Disable `dashboard/a4a-neutral-theme` in the target configuration and reload the entry. The palette marker and A4A color-scheme capability are removed together. Boot clears an old mode attribute for configurations without color-scheme support. The user's saved preference is retained for other supported surfaces and future re-enablement. This flag is not a live configuration subscription: already-open documents need a reload.

## Verification still required

Focused provider tests cover fixed System mode with no cached preference and with cached Light/Dark preferences, immediate rendering, and no preference reads or writes. Existing provider tests retain coverage of preference-driven surfaces. The initial PoC's desktop light/dark palette, keyboard focus, narrow overview, and Hebrew RTL overview were inspected locally; fresh visual verification of the system-only revision is pending.

Before any rollout:

1. Repeat the affected checks and Dashboard build after changes; record current validation in the PR. Keep full-client typechecking separate from the running preview.
2. Inspect the running A4A hostname with the OS in both light and dark modes, including an OS-mode change while open. Confirm existing account choices do not override A4A or change after visiting it. Check initial loading, refresh, and flag-off rollback.
3. Verify overview, sites, clients, purchases/products, resources, agency-client pages, and shared site-detail routes enabled in the release. Exercise tables, selected rows, tabs, forms, all control states, destructive actions, notices, charts, tooltips, dialogs and popovers.
4. Verify both omnibars, support-session treatment, launch-site actions, notification panels and portaled menus. Check that theme changes reach each React root.
5. Check keyboard focus, essential boundaries, text/icon contrast, disabled and loading states, forced colors, zoom, print, and mobile. Verify LTR and a representative RTL locale, including navigation.
6. Compare WordPress.com, CIAB, classic A4A and classic dark-mode surfaces against their baselines. Shared fallback edits and the fixed color-scheme provider option need regression coverage.
7. Confirm monochrome shell branding and real content treatments with design review. Complete a route/token exception inventory before enabling remote environments.

The local OAuth preview did not render an omnibar, so its mobile navigation trigger and language switcher were unavailable. The overview itself was inspected at a 390px viewport. Existing light icon tiles and artwork also need a separate content-design pass.

The source implementation is a starting point for this verification pass; it does not imply every A4A feature-local stylesheet is already dark-ready.
