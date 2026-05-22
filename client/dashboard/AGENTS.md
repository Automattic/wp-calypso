# Multi-site Dashboard

This is the new hosting dashboard for WordPress.com.

## Sub-area Guides

- **me/billing-purchases/** — Billing & purchase management (cancel flows, payment methods, DataViews)

## Conventions

- Use TanStack Query and TanStack Router.
- Don't use Redux and `calypso/state`.
- **Never branch on `appConfig.name`** (e.g. `if (appConfig.name === 'dotcom')`). The dashboard has many variants; hardcoding behavior per variant doesn't scale. Some alternatives:
  1. If the behavior depends on the **site** (e.g. available features, capabilities), use `siteTypeSupportsFeature()` or extend `SiteTypeFeatureSupports` in `utils/site-type-feature-support.ts`.
  2. If the behavior genuinely differs per dashboard variant, add a property to `AppConfig` that each variant provides, and branch on that property instead of the name.
  3. Before doing either, ask: if this UX is better for one variant, wouldn't it be better for all users? Prefer a single code path when possible.

### Dark mode

- Shared dark-mode tokens and cross-surface component overrides live in `client/lib/color-scheme/dark-theme.scss`. Add dashboard-only exceptions to `client/dashboard/app/_dark-theme.scss` using the existing `dashboard-dark-theme-*` mixins (or add a new one and `@include` it from `dashboard-dark-theme`) instead of writing ad-hoc `:root[data-theme='dark']` blocks elsewhere.
- Prefer overriding the existing CSS custom properties (`--dashboard-*`, `--wp-components-*`, `--jp-*`) over hardcoding hex values in component styles.
- For styles authored inside a CSS Module (`*.module.scss`), `:root`-based overrides cannot reach the scope-hashed class. Use the shared `when-dark-theme` mixin from `calypso/assets/stylesheets/shared/mixins/dark-theme` — see `packages/ui/AGENTS.md`.
