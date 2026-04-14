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
