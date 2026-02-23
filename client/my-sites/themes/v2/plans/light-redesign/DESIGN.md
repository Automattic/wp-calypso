# Themes Landing Page Light Redesign

## Overview & Goals

Modernize the logged-out Themes landing page with visual changes and marketing banners to validate the business hypothesis (visitor -> signup, AI builder adoption), without rebuilding the data layer or component architecture.

This is a lighter alternative to the full v2 refactor. Instead of replacing the entire showcase, we make targeted visual changes to the existing components, gated behind a feature flag. If the business metrics validate the approach, we can later commit to the full refactor with confidence.

Design post: https://wpbranddesign.wordpress.com/2025/09/25/themes-lp/

**Primary deliverable**: Visual refresh of the logged-out Theme Showcase at `/themes`.

### Key Decisions

- **In-place modification**: No new v2 directory structure or wrapper components. Existing files are modified with conditional rendering gated behind a feature flag.
- **Feature flag**: `themes/showcase-modern` — active only when logged out. Easy rollback by disabling the flag.
- **Reuse existing data layer**: All Redux state, selectors, actions, URL routing, SSR, and search logic stay untouched.
- **Reuse Plugins LP patterns**: `FullWidthSection` for layout, `TelexBanner`/`BusinessPlanBanner` patterns for banners, `UpsellNudge` for plan upsells.
- **No new shared packages**: All new components live in `client/my-sites/themes/`. Extraction to `packages/` deferred to the full refactor.
- **Theme cards stay**: No new card component. Visual updates applied via an `is-modern` CSS class on the existing `Theme`/`ThemeCard` from `@automattic/design-picker`.

### Estimated Timeline

~5-8 days of AI-led development across 3 milestones.

---

## What Changes

### 1. Hero Section

**Current**: `div.themes__header-logged-out` in `theme-showcase-header.jsx` — light blue background (`#e5f4ff`), Recoleta serif font, `h1` + `p.page-sub-header`.

**Modern**: New `hero-modern/` component, conditionally rendered in `theme-showcase-header.jsx`:
- Wrapped in `FullWidthSection` for full-width background (same pattern as Plugins LP).
- Updated color palette: Blueberry accent, aligned with current brand direction.
- Stronger messaging with clear CTAs (browse themes, try AI builder).
- Decorative illustration on the right side (similar to Plugins LP hero SVG pattern).
- Collapses/simplifies when a search term is active.

**SEO preserved**: `DocumentHead` meta tags, `useThemeShowcaseLoggedOutSeoContent`, canonical URLs, hrefLang — all untouched. The new hero renders the same SEO-provided title and description values with updated visual treatment.

### 2. Filter Bar

**Current**: Two separate blocks in `theme-showcase.jsx` render():
- `div.themes__controls` — `SearchThemes` + `CustomSelectWrapper` (tier dropdown).
- `div.themes__filters` — `ThemesToolbarGroup` (wraps `ResponsiveToolbarGroup`).

**Modern**: New `filter-bar-modern/` component replaces both blocks when flag is on:
- **Category pills**: Horizontal scrollable list — "Recommended" (default), "All", + dynamic subject filters from the `/theme-filters` API. Same data as today (`getTabFilters()`), new pill-shaped visual treatment.
- **Plan dropdown**: Tier filter (Free, Premium, etc.). Same `getTiers()` data, styled to match the pills.
- **Search input**: Reuses the existing `SearchThemes` component from `client/components/search-themes/` (SSR-proven, provides clear button, enter-to-search, and tracks events). Restyled via CSS overrides within `.filter-bar-modern`.
- **Sticky**: CSS `position: sticky` when scrolled past the hero. No JS scroll listeners — replaces the current `InView` + `shouldThemeControlsSticky` state for the logged-out case.

**Data stays the same**: All filter/search handlers (`doSearch`, `onTierSelectFilter`, `onFilterClick`) are passed as callback props. Filter data sources (`getTabFilters()`, `getTiers()`, `getSelectedTabFilter()`) unchanged. `QueryThemeFilters` still renders.

### 3. Theme Cards

**No new component.** Visual updates applied to the existing `Theme` component (`client/components/theme/`) and its underlying `ThemeCard` from `@automattic/design-picker`:

- Add `is-modern` CSS class to the card (via a prop passed through `ThemesSelection` -> `ThemesList` -> `Theme`, or via a parent container class).
- **CSS overrides with `.is-modern`**: 8px border radius (up from 4px), updated hover treatment, adjusted typography/spacing.
- **Hide style variation swatches** for the logged-out modern view (pass empty `styleVariations` or hide via CSS).

### 4. Banners

New marketing banners, interleaved into the theme grid. Each is a presentational component in `client/my-sites/themes/banners-modern/`:

- **AI Builder Banner**: Follows the Plugins LP `TelexBanner` structure — text + illustration, full-width section, CTA linking to the AI builder flow. Themes-specific copy.
- **DIFM Banner**: Follows the Plugins LP `BusinessPlanBanner` structure — dark background, feature highlights, CTA to the DIFM landing page.
- **Contextual Plan Banners**: Reuses the existing `UpsellNudge` component from `client/blocks/upsell-nudge/`. Appears when filtering by a specific plan tier. Themes-specific copy and event names.

**Interleaving**: Uses the same CSS Grid pattern as `SecondUpsellNudge` and `WooDesignWithAIBanner` in `ThemesList` — banners are rendered as siblings to theme cards inside the `div.themes-list` CSS Grid container, spanning all columns with `grid-column: 1/-1` and positioned to specific rows with `grid-row-start`. Passed as children through `ThemesSelection` → `ThemesList`.

**Visibility logic**: Lives in `theme-showcase.jsx`. The banners themselves are purely presentational — the showcase decides when to render each one based on the current filter state and feature flag.

---

## What Stays Untouched

- **Data layer**: No new hooks. All Redux connections, selectors, actions in `state/themes/` unchanged.
- **URL routing / controllers**: No changes to `controller.jsx`, `controller-logged-in.jsx`, `index.web.js`, `index.node.js`.
- **SSR pipeline**: `fetchThemeFilters` -> `fetchThemeData` -> render unchanged.
- **SEO content**: `useThemeShowcaseLoggedOutSeoContent` and related hooks unchanged. Meta tags, canonical URLs, hrefLang all preserved.
- **Search logic**: `doSearch`, filter syntax parsing, `filterToTermTable` unchanged.
- **Pagination**: `ThemesSelection` infinite scroll and `ThemeQueryManager` unchanged.
- **Empty states**: Keep the current minimal empty state.
- **FAQs section**: Deferred (content still being finalized).
- **Logged-in experience**: No changes. Feature flag only activates for logged-out users.
- **MSD (multi-site dashboard)**: Out of scope.
- **`theme-options.js` / `connectOptions`**: Untouched.
- **Partner theme collections**: Existing `ShowcaseThemeCollection` rendering unchanged.

---

## New Files

```
client/my-sites/themes/
├── hero-modern/
│   ├── index.tsx
│   └── style.scss
├── filter-bar-modern/
│   ├── index.tsx
│   └── style.scss
├── banners-modern/
│   ├── ai-builder-banner.tsx
│   ├── difm-banner.tsx
│   ├── plan-banner.tsx
│   └── style.scss
└── hooks/
    └── use-is-theme-showcase-modern-enabled.ts
```

## Modified Files

- `theme-showcase-header.jsx` — conditional render of `hero-modern` vs current header.
- `theme-showcase.jsx` — conditional render of `filter-bar-modern` vs current controls/filters; banner interleaving in the showcase section.
- `theme-showcase.scss` — `.is-modern` card overrides, general logged-out modern styles.
- `config/development.json`, `config/test.json` — feature flag `true`.
- `config/production.json`, `config/stage.json`, `config/horizon.json`, `config/wpcalypso.json` — feature flag `false`. (Skip `config/dashboard-*.json` — Calypso-only feature.)

---

## Milestones

### Milestone 1: Foundation + Hero (~1-2 days)

- Add `themes/showcase-modern` feature flag to config files.
- Create `useIsThemeShowcaseModernEnabled()` hook (flag on + logged out).
- Build hero section (`hero-modern/`) with updated copy, colors, illustration.
- Conditionally render in `theme-showcase-header.jsx`.
- Wrap in `FullWidthSection` for full-width background.
- **Shippable checkpoint**: new hero visible behind flag, everything else unchanged.

### Milestone 2: Filter Bar + Theme Cards (~2-3 days)

- Build filter bar (`filter-bar-modern/`) with category pills, plan dropdown, search input.
- Wire to existing handlers (`doSearch`, `onTierSelectFilter`, `onFilterClick`).
- CSS `position: sticky` for the filter bar.
- Conditionally render in `theme-showcase.jsx`, replacing old controls + filters block.
- Add `is-modern` class to theme cards — CSS overrides for border radius, hover state, typography.
- Hide style variation swatches in logged-out modern view.
- **Shippable checkpoint**: full visual refresh of the browsing experience.

### Milestone 3: Banners + Polish (~2-3 days)

- AI Builder banner (following `TelexBanner` pattern).
- DIFM banner (following `BusinessPlanBanner` pattern).
- Contextual plan banners (using `UpsellNudge`).
- Banner interleaving into the grid.
- Responsive polish across breakpoints.
- Accessibility audit (keyboard nav, ARIA labels, color contrast).
- Analytics: `recordTracksEvent` for banner impressions, CTA clicks, filter interactions.
- **Shippable checkpoint**: complete light redesign, ready for flag rollout.

---

## Relationship to the Full v2 Refactor

This light redesign is a stepping stone. It validates the business hypothesis with minimal engineering investment. If the metrics confirm the approach:

- The `hero-modern` and `filter-bar-modern` components can inform or be evolved into the full v2 equivalents.
- The banner components are reusable as-is in the full refactor.
- The `themes/showcase-modern` flag can coexist with a future `themes/showcase-v2` flag, or be migrated.
- The "v2" namespace (directory, component names, feature flag) remains available for the full refactor.

**Cleanup path for `-modern` suffix:** If metrics validate the redesign, rename/promote the `-modern` components to be the default (remove suffix, remove feature flag gating, delete old code paths). If metrics don't validate, delete the `-modern` components entirely.
