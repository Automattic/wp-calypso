# Themes Landing Page Redesign (v2)

## Overview & Goals

Modernize the Themes landing page design, refresh messaging, and create space for contextual marketing banners, while keeping existing functionality. This builds on the recent Plugins LP work, creating a unified page structure across WordPress.com landing pages.

Design post: https://wpbranddesign.wordpress.com/2025/09/25/themes-lp/

**Primary deliverable**: Logged-out Theme Showcase at `/themes`.

### Key Decisions

- Single component with logged-in/logged-out modes (only logged-out shipped initially).
- **Progressive replacement**: v2 starts as a new layout shell wrapping existing v1 components. v1 components are then progressively swapped for v2 equivalents in subsequent milestones. This allows the feature flag to be removed early.
- Redux-backed custom hooks for data (portable API surface — could be swapped for TanStack Query later).
- Reuse `FullWidthSection` from Plugins LP; `@wordpress/components` for UI primitives; `@wordpress/base-styles` for design tokens.
- URL-driven filter state, same path structure as current for backwards compatibility.
- New shared `ThemeCardV2` component in `packages/components`.
- Feature flag gating logged-out only, following Plugins LP pattern.
- Landscape thumbnails (vertical thumbnails deferred — requires screenshot pipeline changes and no control over .org themes).
- "All" category preserved (revisit in future iteration).

### Rollout Strategy

**Progressive replacement in ~2-week independently shippable milestones.** The v2 page launches early by reusing v1 internals, then iterates toward the full design.

1. **Logged-out** — the deliverable.
2. **MSD** (logged-in, no site selected) — nice-to-have within this project.
3. **Logged-in with site selected** — out of scope, future project.

---

## Architecture

### New Code Location

```
client/my-sites/themes/v2/
├── index.tsx                          # ThemeShowcaseV2 main component
├── style.scss
├── hero/
│   ├── index.tsx                      # Each component: folder with index.tsx
│   └── style.scss                     # and its own style.scss when needed
├── filter-bar/
├── theme-grid/
├── banners/
│   ├── ai-builder-banner.tsx
│   ├── difm-banner.tsx
│   ├── plan-banner.tsx
│   └── style.scss
├── partner-themes/
├── empty-state/
├── faqs/
└── hooks/
    ├── use-is-theme-showcase-v2-enabled.ts
    ├── use-themes.ts
    ├── use-theme-filters.ts
    └── use-theme-showcase-url.ts
```

### Shared Component

`packages/components/src/theme-card-v2/` — index.tsx + style.scss + test/

### Integration Point

The existing `controller-logged-in.jsx` `renderThemes()` function already decides between `loggedIn()` and `loggedOut()`. We add a third branch: if `useIsThemeShowcaseV2Enabled()` returns true, render `ThemeShowcaseV2`. The old logged-out component stays as fallback.

### Testing

- **Unit tests**: React Testing Library + `userEvent` for components and hooks. Focus on hook behavior (data fetching, URL parsing), filter interactions, card rendering, banner visibility logic.
- **E2E tests**: Playwright tests for critical logged-out flows — page load, filtering by category, filtering by plan, search, pagination, navigating to a single theme page.

---

## Data Layer

Redux-backed hooks with a clean, portable API surface. Each hook wraps existing Redux selectors/actions and returns a consistent shape:

```ts
// Example: useThemes hook
function useThemes( query: ThemeQuery ) {
  const dispatch = useDispatch();
  const themes = useSelector( state => getThemesForQuery( state, 'wpcom', query ) );
  const isLoading = useSelector( state =>
    isRequestingThemesForQuery( state, 'wpcom', query )
  );
  const totalCount = useSelector( state =>
    getThemesFoundForQuery( state, 'wpcom', query )
  );

  useEffect( () => {
    dispatch( requestThemes( 'wpcom', query ) );
  }, [ query ] );

  return { data: themes, isLoading, totalCount };
}
```

### Hooks to Build

- `useThemes( query )` — paginated theme list.
- `useThemeFilters()` — available filter categories (subject filters from `/theme-filters` endpoint).
- `useTheme( slug )` — single theme details (for future use, not needed in the showcase grid).

### What We Reuse

- All Redux state shape, selectors, and actions in `state/themes/`.
- The `ThemeQueryManager` pagination logic.
- Theme normalization (wpcom/wporg).
- SSR data fetching in the controller pipeline (`fetchThemeFilters` -> `fetchThemeData` -> render).

### What We Don't Carry Over

- The `connectOptions` HOC pattern from `theme-options.js` (replaced by hooks).
- Manual `ThemeQueryManager` cache checks in controllers (hooks handle loading state).

### What We Simplify But Preserve

- The search box becomes plain text only (no `filter:value` syntax in the input).
- URL-based filters (like `feature:full-site-editing`) are still parsed from the URL and passed to the API query. They just aren't entered via the search box anymore — they come from the category pills, plan dropdown, or from direct URL construction by other pages linking into the showcase.
- The `useThemeShowcaseUrl` hook handles both reading and constructing these URLs, including non-UI filters.

---

## Filter & URL System

### URL Structure

Same path format as current, for backwards compatibility:

```
/themes                                            # Default -> "Recommended"
/themes/all                                        # All themes (non-curated)
/themes/blog                                       # Subject category
/themes/free                                       # Tier only (disambiguated against known tiers)
/themes/blog/free                                  # Category + tier
/themes/blog/free/filter/feature:full-site-editing # Category + tier + non-UI filter
/themes?s=keyword                                  # Search (combinable with any path)
```

Segments are optional and collapse — missing segments are simply omitted from the path. Disambiguation between category and tier uses the existing approach: check against known tier slugs (free, premium, marketplace, partner, woocommerce) vs subject filter slugs (which don't overlap).

### UI Controls

- **Category pills**: "Recommended" (default), "All", plus subject filters from `/theme-filters` endpoint.
- **Plan dropdown**: Tier filter (free, premium, marketplace, partner, woocommerce).
- **Search box**: Plain text, `?s=` query param.

### useThemeShowcaseUrl Hook

Reads current state from URL, constructs new URLs on filter changes. Preserves non-UI filters (like `feature:full-site-editing`) across interactions.

### Sticky Filter Bar

CSS `position: sticky`, no manual scroll listeners.

---

## Theme Cards (Shared Component)

**Location**: `packages/components/src/theme-card-v2/`

Built with `@wordpress/components` primitives (Card, Button) and `@wordpress/base-styles` for design tokens.

### Props

- `theme` — theme data object (name, slug, screenshot URL, author, tier/plan label).
- `onPreview` — callback for the Preview CTA.
- `demoUrl` — link to live demo.
- `isActive` — whether this theme is currently active (for logged-in, future use).

### Visual Spec

- Landscape thumbnail (existing screenshots, no change needed).
- 8px border radius.
- Theme name + plan label below thumbnail.
- Hover state reveals CTAs: "Preview" button + "Live Demo" link.
- No style variant swatches (removed for scannability).
- Partner themes displayed in their existing landscape format.

### Out of Scope (Future Logged-in Work)

- Activate/install actions.
- Purchase flows.
- Style variation picker.
- "More" action menu.

The card is intentionally simple — a display + preview component. Action complexity lives in the showcase page, not the card.

---

## Banners

**AI Builder Banner**: Replaces the old "Design your own" Assembler banner. CTA links to the AI website builder flow. Positioned after the first batch of theme cards in the grid.

**DIFM Banner**: Promotes "Built by WordPress.com" (Done-For-Me) service. Copy aligned with the DIFM landing page. Positioned further down the page, after more theme rows.

**Contextual Plan Banners**: Appear when filtering by a specific plan tier. Highlight features included in that plan. Different copy per tier. Also surface in the Partner themes section with pricing context.

**Implementation**: Each banner is a simple presentational component. Visibility logic lives in the parent `ThemeShowcaseV2` — the banners themselves don't decide when to show, they just render content. The showcase interleaves them into the grid at defined positions.

---

## Search & Empty States

**Search results**: When a search term is active, the grid shows matching themes. The hero collapses or simplifies (TBD with design — the current implementation hides it).

**Empty state** (no results): Three visual cards offering next steps:
- **Build with AI** — links to AI website builder.
- **Hire an expert** — links to DIFM / expert hiring.
- **Upload a theme** — links to theme upload flow.

These replace the current minimal empty state (two small text links).

---

## FAQs

Collapsible FAQ section at the bottom of the page. Content is still being finalized by the content team. Implementation: a simple accordion using `@wordpress/components` (Panel or custom details/summary elements). FAQ data stored as a static array of question/answer pairs, easy to update.

---

## SSR & SEO

### What We Preserve

- Server-side rendering of the showcase (the controller pipeline: `fetchThemeFilters` -> `fetchThemeData` -> render).
- Meta tags: `<title>`, `og:description`, canonical URLs.
- `hrefLang` links for CJK locales (logged-out only).
- Localized paths for magnificent locales (`/ja/themes/`, `/zh/themes/`).

### What Changes

- SEO content refreshed to match the new copy (currently hardcoded in `use-theme-showcase-logged-out-seo-content.js` — we create a v2 equivalent).
- The v2 controller branch feeds data into the same Redux store, so SSR hydration works the same way.

---

## Accessibility

- All interactive elements keyboard-navigable.
- Filter pills and dropdown accessible via arrow keys.
- Theme cards: hover CTAs also accessible via focus/tab.
- Sticky filter bar doesn't trap focus.
- Proper ARIA labels for search, filters, and grid.
- Color contrast meeting WCAG AA (Blueberry accent verified against white/light backgrounds).

---

## Milestones (~2 weeks each, independently shippable)

The v2 showcase is delivered as a series of independently shippable milestones. Each milestone delivers visible, reviewable progress. The feature flag can be removed after Milestone 1, since the page is fully functional from the start.

### Milestone 1: v2 Shell with v1 Internals

Launch the new layout by wrapping existing v1 components. Fully functional page from day one.

- Add feature flag (`themes/showcase-v2`) to config.
- Implement `useIsThemeShowcaseV2Enabled()` hook (logged-out only).
- Create v2 page shell + controller integration.
- Wrap existing v1 `connectOptions(ThemeShowcase)` inside the new layout — reuses all v1 functionality (cards, grid, pagination, search, filters).
- Update logged-out global navigation (consistent with Plugins LP).
- Hero section: illustration, updated copy, Blueberry accent.
- Wrap sections in `FullWidthSection` for full-width backgrounds.
- SSR/SEO: ensure existing meta tags, hrefLang, canonical URLs still work.
- **Goal: remove feature flag after this milestone. The v2 page is live.**

### Milestone 2: v2 Filter Bar + URL Hooks

Replace the v1 filter bar with the new design.

- Build data hooks: `useThemeFilters`, `useThemeShowcaseUrl`.
- Build v2 filter bar: category pills ("Recommended", "All", + subject filters), plan dropdown, search input.
- Sticky filter bar via CSS `position: sticky`.
- URL-driven state: clicking a pill or changing the dropdown updates the URL.
- Remove v1 filter bar from v2 showcase.
- Unit tests for hooks and filter interactions.

### Milestone 3: v2 Theme Cards + Grid

Replace the v1 theme cards and grid with the new design.

- Build data hook: `useThemes`.
- New `ThemeCardV2` in `packages/components/`: landscape thumbnail, 8px radius, hover CTAs, plan label.
- 3-column responsive grid, infinite scroll pagination.
- Wire grid to `useThemes` hook with current filter/search state.
- Remove v1 `ThemesSelection` from v2 showcase.
- Unit tests for card rendering and grid behavior.

### Milestone 4: Banners + Empty States + FAQs + Polish

Add the marketing/conversion layer and polish.

- AI builder banner, DIFM banner, contextual plan banners.
- Partner themes section with pricing context.
- Banner interleaving logic.
- Search results view adjustments (hero collapse).
- Empty state with three CTA cards: Build with AI, Hire an expert, Upload a theme.
- FAQ accordion section.
- SEO content refresh.
- Responsive polish across breakpoints.
- Accessibility audit and fixes.
- E2E tests (Playwright) for critical logged-out flows.

### Nice-to-have: MSD Support

- Extend feature flag to logged-in users with dashboard opt-in and no site selected.
- Adapt hero copy and CTAs for MSD context (signup vs site-creation).
- Test with masterbar navigation.

### Out of Scope (Documented for Future)

- Logged-in with site selected (activate/install, site selector, My Themes).
- Vertical thumbnails (requires screenshot pipeline changes + .org theme solution).
- Revisiting the "All" category.
