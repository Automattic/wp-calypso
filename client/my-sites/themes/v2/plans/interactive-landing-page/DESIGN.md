# Themes Landing Page: Interactive Landing Page (Landpack + Interactivity API)

## Overview & Goals

Decouple the logged-out Themes landing page from Calypso entirely by building it as a WordPress block editor page using Landpack and the Interactivity API. This is a third option alongside the [light redesign](../light-redesign/DESIGN.md) and [full refactor](../full-refactor/DESIGN.md).

**Primary deliverable**: A fully functional logged-out Theme Showcase at a new URL, with full feature parity to the current Calypso-served `/themes` page. Once validated, the current `/themes` route redirects to the new page.

### Why This Approach

- **Decoupled from Calypso**: The Themes LP no longer depends on Calypso's build pipeline, Redux store, SSR infrastructure, or deployment cycle.
- **Native WordPress**: Built with standard WordPress blocks, edited in Gutenberg. Marketing content (hero, banners, FAQs) can be updated without code deploys.
- **Lightweight runtime**: The Interactivity API is ~10 KB vs React's ~40+ KB. Server-rendered HTML with progressive enhancement.
- **Aligned with WordPress direction**: The Interactivity API is WordPress's official solution for front-end block interactivity (stable since WP 6.5).

### Key Decisions

- **Block suite architecture**: Multiple smaller, composable blocks sharing a common Interactivity API namespace, rather than one monolithic block.
- **Full feature parity**: Search, category/tier filtering, infinite scroll, SEO, and URL-driven state must all work from launch.
- **Hybrid data fetching**: PHP renders the initial page server-side (SEO), then the Interactivity API handles subsequent client-side interactions.
- **New URL first**: Start on a separate URL, redirect `/themes` once validated.
- **Custom blocks in wpcom repo**: The interactive blocks live in `wp-content/plugins/themes-showcase-blocks/` alongside Landpack.

---

## Architecture

### Page Composition

The page is a WordPress page on a Landpack-enabled site, composed of standard Landpack blocks for marketing content and custom interactive blocks for the showcase functionality:

```
┌─────────────────────────────────────┐
│  Hero Section (landpack/section)    │  Landpack
├─────────────────────────────────────┤
│  Filter Bar                         │  themes-showcase/filter-bar
├─────────────────────────────────────┤
│  Theme Grid (fixed, 12 themes)      │  themes-showcase/theme-grid
├─────────────────────────────────────┤
│  AI Builder Banner (landpack/*)     │  Landpack
├─────────────────────────────────────┤
│  Theme Grid (fixed, 12 themes)      │  themes-showcase/theme-grid
├─────────────────────────────────────┤
│  DIFM Banner (landpack/*)           │  Landpack
├─────────────────────────────────────┤
│  Theme Grid (infinite scroll)       │  themes-showcase/theme-grid
├─────────────────────────────────────┤
│  FAQs (landpack/question)           │  Landpack
├─────────────────────────────────────┤
│  Footer (landpack/footer-section)   │  Landpack
└─────────────────────────────────────┘
```

The exact number of grids and their arrangement is fully configurable in the editor — the page editor can freely add, remove, and reorder grids and banners.

### Shared State (Interactivity API Store)

All custom blocks share the `themes-showcase` namespace:

```js
import { store, getContext } from '@wordpress/interactivity';

store( 'themes-showcase', {
  state: {
    // Filter state (written by filter-bar, read by filter-responsive grids)
    category: 'recommended',
    tier: '',
    searchQuery: '',
    filters: [],               // Available filter categories from /theme-filters

    // Derived state
    get currentUrl() { /* constructs URL from category + tier + search */ },
  },
  actions: {
    setCategory() { /* updates state.category, pushes URL */ },
    setTier() { /* updates state.tier, pushes URL */ },
    setSearch() { /* debounced, updates state.searchQuery, pushes URL */ },
  },
} );
```

Each `theme-grid` block instance manages its own theme data in `data-wp-context` (not in the global store), keeping grid state isolated:

```html
<div
  data-wp-interactive="themes-showcase"
  data-wp-context='{ "themes": [...], "page": 1, "totalCount": 100, "isLoading": false }'
>
  <!-- Grid content rendered via data-wp-each -->
</div>
```

### Data Flow

1. **Server render**: PHP `render_callback` for each block fetches initial data via internal wpcom API calls. The filter bar reads the URL to determine initial filter state. Each grid fetches themes matching its configured query (+ URL filters if `respondToFilters` is true).
2. **Hydration**: The Interactivity API hydrates the store from server-rendered `data-wp-context` values. The page is fully functional HTML before any JavaScript loads.
3. **Client-side interaction**: User clicks a filter pill → `actions.setCategory()` updates shared state + `history.pushState` → grids with `respondToFilters: true` observe the change via `data-wp-watch` → fetch new theme data from the wpcom REST API → update their `data-wp-context` → `data-wp-each` re-renders the card list.

### Deployment

Custom blocks live in the `wpcom` repo:

```
wp-content/plugins/themes-showcase-blocks/
├── themes-showcase-blocks.php         # Plugin bootstrap
├── package.json
├── src/
│   ├── filter-bar/
│   │   ├── block.json
│   │   ├── edit.tsx                   # Editor UI
│   │   ├── render.php                # Server render
│   │   ├── view.ts                   # Interactivity API store + actions
│   │   └── style.scss
│   ├── theme-grid/
│   │   ├── block.json
│   │   ├── edit.tsx
│   │   ├── render.php
│   │   ├── view.ts
│   │   └── style.scss
│   └── theme-card/
│       ├── block.json
│       ├── edit.tsx
│       ├── render.php
│       └── style.scss
└── build/                             # Compiled output
```

Built with `@wordpress/scripts`. Deployed via the standard wpcom deployment process, same as Landpack.

---

## Block Specifications

### `themes-showcase/filter-bar`

**Purpose**: Category pills, plan tier dropdown, and search input. Writes to the shared `themes-showcase` store.

**Server render (PHP)**:
- Reads URL path to determine initial active category and tier.
- Fetches available filter categories from the `/theme-filters` API.
- Renders full filter bar HTML with all pills, dropdown options, and search input pre-populated.
- Stores initial state in `data-wp-context`.

**Interactivity API directives**:
- `data-wp-on--click` on each category pill → `actions.setCategory`
- `data-wp-on--change` on tier dropdown → `actions.setTier`
- `data-wp-on--input` on search field → `actions.setSearch` (debounced via `setTimeout`)
- `data-wp-class--is-active` on pills → bound to `state.category`
- `data-wp-bind--value` on search input → bound to `state.searchQuery`
- `data-wp-bind--aria-pressed` on pills for accessibility

**URL synchronization**: Filter actions call `history.pushState` to update the URL without a page reload. URL format matches current Calypso paths for backwards compatibility:

```
/themes                          → category: recommended, tier: (none)
/themes/blog                     → category: blog
/themes/free                     → tier: free
/themes/blog/free                → category: blog, tier: free
/themes?s=keyword                → searchQuery: keyword
```

**Sticky behavior**: CSS `position: sticky` with a defined `top` value.

### `themes-showcase/theme-grid`

**Purpose**: Displays a grid of theme cards. Each instance is independently configurable.

**Editor attributes (block.json)**:
- `query` (object): Base API query parameters — e.g., `{ filter: 'recommended' }`, `{ tier: 'partner' }`
- `count` (number): Max themes to display. `0` = unlimited.
- `respondToFilters` (boolean): Whether this grid reacts to the filter bar's shared state. When `true`, the filter bar's category/tier/search are merged into this grid's base query. When `false`, the grid always shows its fixed query.
- `pagination` (string): `none` | `infinite-scroll` | `load-more`
- `columns` (number): Grid column count (default 3, responsive).

**Server render (PHP)**:
- Reads the block's `query` attribute.
- If `respondToFilters` is true, also reads the URL to merge in current filter state.
- Fetches theme data via internal wpcom API call.
- Renders theme cards as HTML within the grid.
- Stores theme data + pagination metadata in `data-wp-context`.

**Interactivity API**:
- `data-wp-watch` on shared store's `state.category`, `state.tier`, `state.searchQuery` (only when `respondToFilters` is true). When filters change, triggers a new API fetch and updates the grid's `data-wp-context`.
- `data-wp-each--theme` iterates over the context's theme array to render cards.
- `data-wp-key` on each card for efficient DOM reconciliation.
- Infinite scroll: `data-wp-init` sets up an `IntersectionObserver` on a sentinel element at the grid's end. When visible, triggers `actions.loadMore`.
- `data-wp-class--is-loading` on the grid container for loading states.

### `themes-showcase/theme-card`

**Purpose**: Individual theme card display. Rendered by the grid (not placed independently in the editor).

**Display**:
- Landscape screenshot thumbnail (lazy-loaded via `loading="lazy"`)
- Theme name
- Plan tier label (Free, Premium, etc.)
- Hover state: "Preview" button + "Live Demo" link (CSS-driven, no JS needed)

**Interactivity**: Minimal. Click on the card or "Preview" navigates to the theme detail page. "Live Demo" opens the demo URL. No complex state management.

---

## SEO & Server-Side Rendering

### Natural Advantage

WordPress natively server-renders every page. Unlike the Calypso approach (which requires a custom SSR pipeline), the Landpack page produces complete HTML from the server by default. The Interactivity API hydrates on top without replacing the server-rendered content.

### Meta Tags & SEO Content

- **Title & description**: Set via Landpack's SEO editor plugin (`page-seo.js`) or Jetpack SEO. Stored as post meta. Can be dynamically adjusted per-URL via PHP filters if needed (e.g., different title for `/themes/blog` vs `/themes`).
- **Canonical URLs**: WordPress + Jetpack handle these. Custom canonical for filtered views (e.g., `/themes/blog`) via the `wp_head` action.
- **hrefLang for CJK locales**: Must be explicitly implemented. The current Calypso implementation supports `/ja/themes/`, `/zh/themes/` etc. On the WordPress side, this requires either multisite with locale-specific sites or a custom `wp_head` filter that outputs hrefLang links based on known supported locales.
- **Structured data**: If applicable, rendered server-side in PHP.

### Initial Page Load

The theme grid's PHP `render_callback` fetches and renders the initial theme set as real HTML. Bots and users with JavaScript disabled see a fully functional page with theme cards, filter UI, and all content. The Interactivity API only adds dynamic behavior on top.

---

## URL Routing & Hosting

### Phase 1: New URL

The Landpack page lives at a new URL (e.g., `wordpress.com/theme-showcase` or similar). This allows:
- Side-by-side comparison with the existing Calypso `/themes` page.
- Independent testing and validation.
- No risk to existing SEO rankings during development.

The page needs custom rewrite rules to support the path-based filter URLs (`/theme-showcase/blog/free` etc.). These are registered via `add_rewrite_rule()` in the plugin, mapping path segments to query vars that the block's PHP render reads.

### Phase 2: Redirect

Once validated, the Calypso `/themes` route is updated to redirect logged-out users to the new page. This can be done at the Calypso routing level or at the nginx/server level.

### Phase 3: Canonical URL

Eventually, the new page takes over the `/themes` URL directly. The Calypso route is removed for logged-out users.

---

## Analytics

### Section View Tracking

Landpack's built-in `tracks.js` automatically fires `wpcom_page_section_view` events when sections scroll into view. This covers the hero, banners, and FAQ sections with no additional work.

### Custom Events

The custom blocks fire Tracks events for:
- Filter interactions: category pill click, tier change, search submit
- Theme card interactions: card click, preview click, demo click
- Pagination: load more / infinite scroll trigger
- Banner interactions: CTA clicks (handled by Landpack's existing tracking)

Events are fired via the `window._tkq` array (the standard Tracks client-side API used by Landpack) or via the Tracks REST API.

### Comparison with Current Analytics

The existing Calypso page uses `recordTracksEvent` from `@automattic/calypso-analytics`. The new page must fire equivalent events with the same event names and properties to maintain analytics continuity. A mapping document should be created during implementation.

---

## Risk Assessment & Feasibility

### High-Risk Areas

**1. Complex client-side state management**

The Interactivity API store is designed for simple reactive state within individual blocks. Managing a multi-filter state shared across a filter bar and multiple grids, with URL synchronization and debounced search, is significantly more complex than typical use cases.

*Mitigation*: Keep the shared store minimal (only filter state). Each grid manages its own theme data in `data-wp-context`. Grids are self-contained in their data fetching — they subscribe to filter state changes but own their data lifecycle.

*Fallback*: If store coordination proves too fragile, consolidate the filter bar + main grid into a single block.

**2. `data-wp-each` for large, dynamic lists**

Re-rendering 20+ theme cards on every filter change via `data-wp-each` may have performance issues. The directive's DOM reconciliation is simpler than React's virtual DOM diffing.

*Mitigation*: Paginate aggressively (20 themes per batch). Use `data-wp-key` on every card. Profile re-render performance early in development.

*Fallback*: For grids with many items, switch to manual DOM manipulation in actions (clear container, append new card HTML) rather than relying on `data-wp-each` for the full list.

**3. Debounced search with live results**

Debouncing input, making API calls, and re-rendering the grid — straightforward in React, less tested in the Interactivity API.

*Mitigation*: Implement debounce via `setTimeout` in the `setSearch` action. API responses update the grid's context, triggering `data-wp-each` re-render.

*Fallback*: Search submits on Enter (form submission) rather than live-as-you-type results. This is a UX trade-off but eliminates the debounce complexity.

**4. Cross-block communication reliability**

Multiple blocks reading from / writing to the same namespace store is the designed pattern, but real-world examples of this level of coordination are scarce. Potential issues: race conditions between concurrent grid fetches, stale state in `data-wp-watch` callbacks, timing of updates.

*Mitigation*: Only filter state is shared globally. Theme data is per-grid-instance. Each grid fetches independently when it detects a filter change. No grid depends on another grid's data.

*Fallback*: If cross-block communication is unreliable, merge the filter bar and the main grid into a single block while keeping other grids as independent fixed-query blocks.

**5. URL state without a client-side router**

The current page uses Calypso's client-side router. The Interactivity API's client-side navigation is experimental and not stable.

*Mitigation*: Use `history.pushState/replaceState` directly in action handlers. PHP reads the URL on initial page load to set server-rendered state. No dependency on the Interactivity API router.

*Fallback*: Filter changes trigger full page navigations. WordPress server rendering is fast, and the page is lightweight without Calypso's JS bundle. This may actually feel faster than the current SPA approach for many users.

### Medium-Risk Areas

- **Accessibility**: `data-wp-bind--aria-*` directives handle ARIA attributes. Keyboard navigation for filter pills (arrow keys, Home/End) and infinite scroll announcements need manual implementation.
- **Analytics continuity**: Events must match existing Calypso event names/properties. Requires an explicit mapping exercise.
- **i18n**: Standard WordPress translation system (`__()` in PHP, `@wordpress/i18n` in JS). All user-facing strings must be translatable.

### Low-Risk Areas

- **Hero, banners, FAQs**: Standard Landpack use cases. Well-proven.
- **Responsive layout**: Landpack's utility class system and CSS Grid/Flexbox.
- **Theme card display**: Mostly presentational, minimal interactivity.
- **SEO**: WordPress's native server rendering is inherently SEO-friendly. This is actually lower risk than the current Calypso SSR approach.

---

## Comparison with Other Approaches

| Aspect | Light Redesign | Full Refactor (v2) | Interactive LP (this) |
|--------|---------------|--------------------|-----------------------|
| **Decoupled from Calypso** | No | No | Yes |
| **Runtime size** | Full Calypso bundle | Full Calypso bundle | ~10 KB (Interactivity API) |
| **Marketing content editable** | Code deploy | Code deploy | Gutenberg editor |
| **Data layer** | Existing Redux | New Redux hooks | wpcom REST API + Interactivity API store |
| **SSR approach** | Calypso SSR pipeline | Calypso SSR pipeline | Native WordPress PHP rendering |
| **New code location** | `client/my-sites/themes/` | `client/my-sites/themes/v2/` | `wpcom` repo, separate plugin |
| **Risk level** | Low | Medium | High (new technology stack) |
| **Maintenance burden** | Low (CSS changes) | Medium (new components) | Medium-High (new plugin + blocks) |
| **Reusability** | Calypso only | Calypso only | Any WordPress site |
| **Team skill requirements** | React/Calypso | React/Calypso | PHP + Interactivity API + Landpack |

---

## Milestones

Estimates assume AI-led development with 1 engineer reviewing, steering, and unblocking. This is a new technology stack (Interactivity API + Landpack) for the team, so estimates include learning curve and experimentation time. The high-risk items identified above may cause individual milestones to overrun — the fallback strategies are designed to keep total project duration bounded.

**Total estimated duration: ~4-6 weeks.**

### Milestone 1: Plugin Scaffold + Filter Bar Block (~3-5 days)

- Set up the `themes-showcase-blocks` plugin in the wpcom repo.
- Build tooling (`@wordpress/scripts`, block registration, PHP bootstrap).
- Implement `themes-showcase/filter-bar` block:
  - PHP render: fetch filters from `/theme-filters` API, render pills + dropdown + search.
  - Interactivity API store: `state.category`, `state.tier`, `state.searchQuery`.
  - URL read (PHP) + URL push (JS) for filter state.
  - Sticky CSS.
- Create the Landpack page with a hero section and the filter bar block.
- **Checkpoint**: filter bar renders, interactive state works, URL updates correctly.

Higher estimate accounts for: initial plugin scaffolding in the wpcom repo (unfamiliar deployment pipeline), first contact with the Interactivity API store patterns, and validating that cross-block state sharing works at all (early risk validation for High-Risk #1 and #4).

### Milestone 2: Theme Grid Block (Fixed Mode) (~4-6 days)

- Implement `themes-showcase/theme-grid` block with `pagination: none` mode.
- PHP render: fetch themes from wpcom API, render card HTML.
- Editor attributes: `query`, `count`, `respondToFilters`, `columns`.
- Theme card template with screenshot, name, tier label, hover CTAs.
- Wire `respondToFilters` grids to the shared filter store via `data-wp-watch`.
- Client-side data re-fetching when filters change.
- Add multiple grids to the page interleaved with Landpack banners.
- **Checkpoint**: grids display themes, filter changes update the responsive grid.

This is the heaviest milestone. It validates the core architectural bet: multiple grid blocks with independent data sources, one responding to the shared filter store. If `data-wp-each` re-rendering or cross-block communication proves problematic (High-Risk #2 and #4), this is where fallback decisions happen.

### Milestone 3: Infinite Scroll + Search (~3-4 days)

- Add `pagination: infinite-scroll` mode to the theme grid block.
- IntersectionObserver-based scroll detection.
- Paginated API fetching with page accumulation.
- Debounced search implementation.
- Loading states for grid re-fetches and pagination.
- **Checkpoint**: full browsing experience with search, filters, and infinite scroll.

Moderate complexity. IntersectionObserver is well-understood; the risk is in combining it with `data-wp-each` list appending (High-Risk #2) and debounced search (High-Risk #3). If live search proves unreliable, the Enter-to-submit fallback can be implemented quickly.

### Milestone 4: SEO + URL Routing + Analytics (~3-5 days)

- Custom rewrite rules for path-based filter URLs.
- SEO metadata (title, description, canonical) per filter combination.
- hrefLang for CJK locales.
- Tracks event integration: filter clicks, card clicks, section views.
- Analytics event mapping document (Calypso events → new page events).
- **Checkpoint**: SEO parity with current page, analytics firing correctly.

The URL rewrite rules and dynamic SEO metadata per filter combination are the main unknowns. Tracks integration is straightforward (Landpack already uses `_tkq`). The hrefLang implementation depends on how the wpcom site handles locales.

### Milestone 5: Polish + Validation (~3-4 days)

- Responsive design polish across breakpoints.
- Accessibility audit: keyboard navigation, ARIA labels, focus management, color contrast.
- Performance profiling: `data-wp-each` re-render benchmarks, API response times.
- Cross-browser testing.
- Side-by-side comparison with current `/themes` page.
- **Checkpoint**: ready for redirect from `/themes`.

Largely deterministic work. The performance profiling may surface issues that require revisiting earlier milestones (especially if `data-wp-each` needs to be replaced with manual DOM manipulation).

### Future: Redirect + Migration

- Update Calypso routing to redirect logged-out `/themes` to the new page.
- Monitor analytics for parity.
- Eventually claim the `/themes` URL directly.

---

## Relationship to Other Plans

This approach can coexist with the other two plans:

- **If this succeeds**: The Calypso `/themes` route redirects to the Landpack page for logged-out users. The logged-in experience remains in Calypso (either current or full-refactor v2).
- **If this is abandoned**: The learnings about Interactivity API limitations inform whether to pursue the light redesign or full refactor. No Calypso code was changed, so there's nothing to revert.
- **Hybrid possibility**: The light redesign could ship first (quick wins, low risk) while this approach is developed in parallel. If the interactive LP validates, it replaces the light redesign.
