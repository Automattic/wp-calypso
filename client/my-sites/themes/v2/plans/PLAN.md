# Themes Landing Page v2 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the logged-out Themes landing page with a modern UI, unified layout with the Plugins LP, and refreshed messaging.

**Architecture:** A new `client/my-sites/themes/v2/` directory containing a `ThemeShowcaseV2` component. The v2 page launches early by wrapping existing v1 components in the new layout, then progressively replaces them with v2 equivalents. Redux-backed custom hooks provide a portable data layer. Shared `ThemeCardV2` lives in `packages/components`. Reuses `FullWidthSection` from Plugins LP and `@wordpress/components` for UI primitives.

**Strategy:** Progressive replacement in ~2-week independently shippable milestones. Feature flag removed after Milestone 1.

**Tech Stack:** React + TypeScript, Redux (via custom hooks), `@wordpress/components`, `@wordpress/base-styles`, `@wordpress/icons`, CSS/SCSS.

**Design doc:** `client/my-sites/themes/v2/plans/DESIGN.md`

---

## Milestone 1: v2 Shell with v1 Internals

Goal: Launch the new layout by wrapping existing v1 components. Fully functional page from day one. Feature flag can be removed after this milestone.

### Task 1.1: Feature Flag

**Files:**
- Modify: `config/development.json` — add `"themes/showcase-v2": true` to the `features` object
- Modify: `config/test.json` — add `"themes/showcase-v2": true`
- All other config files (`production.json`, `stage.json`, `horizon.json`, `wpcalypso.json`, `dashboard-*.json`) — add `"themes/showcase-v2": false`

**Step 1: Add the feature flag to all config files**

Add `"themes/showcase-v2"` to the `features` object in each config file. Set to `true` in `development.json` and `test.json`, `false` everywhere else.

Follow the pattern of `"marketplace-redesign": true` which appears in the same files.

**Step 2: Commit**

```bash
git add config/
git commit -m "feat(themes): add themes/showcase-v2 feature flag"
```

---

### Task 1.2: useIsThemeShowcaseV2Enabled Hook

**Files:**
- Create: `client/my-sites/themes/v2/hooks/use-is-theme-showcase-v2-enabled.ts`
- Create: `client/my-sites/themes/v2/hooks/test/use-is-theme-showcase-v2-enabled.test.ts`

**Step 1: Write the failing tests**

Test cases:
- Returns `true` when feature flag is on and user is logged out.
- Returns `false` when feature flag is off, even if user is logged out.
- Returns `false` when user is logged in (regardless of feature flag).
- Returns `false` when a site is selected (regardless of anything else).

Follow the test patterns in `client/my-sites/themes/test/logged-out.jsx`: use `createReduxStore`, `setStore`, and render a test component that calls the hook.

**Step 2: Run tests to verify they fail**

```bash
yarn test-client client/my-sites/themes/v2/hooks/test/use-is-theme-showcase-v2-enabled.test.ts
```

**Step 3: Implement the hook**

Follow the pattern from `client/my-sites/plugins/hooks/use-is-marketplace-redesign-enabled.ts`:

```typescript
import { isEnabled } from '@automattic/calypso-config';
import { useSelector } from 'react-redux';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export function useIsThemeShowcaseV2Enabled(): boolean {
	const siteId = useSelector( getSelectedSiteId );
	const isLoggedIn = useSelector( isUserLoggedIn );

	if ( siteId ) {
		return false;
	}

	return isEnabled( 'themes/showcase-v2' ) && ! isLoggedIn;
}
```

**Step 4: Run tests to verify they pass**

**Step 5: Commit**

```bash
git add client/my-sites/themes/v2/hooks/
git commit -m "feat(themes): add useIsThemeShowcaseV2Enabled hook"
```

---

### Task 1.3: v2 Page Shell with v1 Internals + Controller Integration

**Files:**
- Create: `client/my-sites/themes/v2/index.tsx`
- Create: `client/my-sites/themes/v2/style.scss`
- Modify: `client/my-sites/themes/controller.jsx` — add v2 branch in `loggedOut()`

**Step 1: Create the v2 shell component**

The v2 shell wraps the existing v1 components (`ThemesSelection`, filter bar, etc.) inside the new layout structure. This is a wrapper, not a rewrite.

```tsx
import Main from 'calypso/components/main';
import FullWidthSection from 'calypso/components/full-width-section';
import { connectOptions } from '../theme-options';
import ThemeShowcase from '../theme-showcase';

import './style.scss';

const ConnectedThemeShowcase = connectOptions( ThemeShowcase );

export default function ThemeShowcaseV2( props ) {
	return (
		<Main fullWidthLayout isLoggedOut className="theme-showcase-v2">
			{ /* Hero will be added in Task 1.5 */ }
			<FullWidthSection className="theme-showcase-v2__content" enabled>
				<ConnectedThemeShowcase
					{ ...props }
					origin="wpcom"
					defaultOption="signup"
					getScreenshotOption={ function () {
						return 'info';
					} }
					source="showcase"
					showUploadButton={ false }
					loggedOutComponent
				/>
			</FullWidthSection>
		</Main>
	);
}
```

Note: We're reusing `connectOptions( ThemeShowcase )` — the exact same thing `logged-out.jsx` renders. The only difference is the wrapping layout.

**Step 2: Integrate into the controller**

Modify `client/my-sites/themes/controller.jsx`, in the `loggedOut()` function:

```jsx
import { isEnabled } from '@automattic/calypso-config';
import ThemeShowcaseV2 from './v2';

export function loggedOut( context, next ) {
	performanceMark( context, 'themesLoggedOut' );
	if ( context.isServerSide && Object.keys( context.query ).length > 0 ) {
		return next();
	}

	const props = getProps( context );

	if ( isEnabled( 'themes/showcase-v2' ) ) {
		context.primary = <ThemeShowcaseV2 { ...props } />;
		return next();
	}

	context.primary = <LoggedOutComponent { ...props } />;
	next();
}
```

**Step 3: Verify locally**

```bash
yarn start
```

Visit `http://calypso.localhost:3000/themes` while logged out. You should see the existing theme showcase wrapped in the new v2 layout shell.

**Step 4: Commit**

```bash
git add client/my-sites/themes/v2/ client/my-sites/themes/controller.jsx
git commit -m "feat(themes): add ThemeShowcaseV2 shell wrapping v1 internals"
```

---

### Task 1.4: Update Logged-out Global Navigation

**Files:**
- Create: `client/my-sites/themes/v2/navigation/index.tsx`
- Create: `client/my-sites/themes/v2/navigation/style.scss`
- Modify: `client/my-sites/themes/v2/index.tsx`

**Step 1: Study the Plugins LP navigation**

Read these files to understand the logged-out navigation pattern:
- `client/my-sites/plugins/plugins-discovery-page/index.jsx`
- `client/layout/logged-out.jsx`

**Step 2: Implement the navigation component**

Navigation should match the Plugins LP logged-out header (WordPress.com logo, top-level links, CTA). If a shared logged-out navigation component exists, reuse it. If not, build one and note it should be extracted to a shared location later.

**Step 3: Wire into ThemeShowcaseV2 as the first child**

**Step 4: Commit**

```bash
git add client/my-sites/themes/v2/navigation/
git commit -m "feat(themes): add logged-out global navigation to v2 showcase"
```

---

### Task 1.5: Hero Section

**Files:**
- Create: `client/my-sites/themes/v2/hero/index.tsx`
- Create: `client/my-sites/themes/v2/hero/style.scss`
- Modify: `client/my-sites/themes/v2/index.tsx`

**Step 1: Implement the hero component**

Reference the design post (section "1. Hero"):
- Illustration for visual alignment with Plugins LP.
- Updated copy (coordinate with design/content team for final strings).
- Blueberry as the lead accent color.
- Wrap in `FullWidthSection` for full-width background.
- Use `@wordpress/base-styles` design tokens for spacing, colors, typography.
- Responsive: illustration alongside text on desktop, stacked on mobile.

**Step 2: Wire into ThemeShowcaseV2 between navigation and content**

**Step 3: Commit**

```bash
git add client/my-sites/themes/v2/hero/
git commit -m "feat(themes): add hero section to v2 showcase"
```

---

### Task 1.6: SSR/SEO Verification

**Files:**
- No new files — verification task.

**Step 1: Verify SSR works**

Confirm that the existing SSR pipeline (`fetchThemeFilters` → `fetchThemeData` → render) still works correctly with the v2 shell. The v2 component wraps the same `ThemeShowcase` component, so SSR hydration should work unchanged.

**Step 2: Verify SEO meta tags**

Check that `<title>`, `og:description`, canonical URLs, and hrefLang links are still generated correctly. These are set by the controller pipeline and the existing SEO hooks, which should be unaffected.

**Step 3: If any issues found, fix them. Commit if changes needed.**

---

### Task 1.7: Remove Feature Flag (Ship v2 Shell)

**Files:**
- Modify: all config files — set `"themes/showcase-v2": true` everywhere (or remove the flag entirely and the `isEnabled` check).

**Step 1: Enable the flag in all environments**

Once the v2 shell is verified and reviewed, enable the flag in production. The page is fully functional — it's the same v1 internals with a new outer layout.

**Step 2: Commit**

```bash
git commit -m "feat(themes): enable v2 showcase for all logged-out users"
```

---

## Milestone 2: v2 Filter Bar + URL Hooks

Goal: Replace the v1 filter bar with the new design. The v1 theme grid/cards/pagination remain.

### Task 2.1: useThemeFilters Data Hook

**Files:**
- Create: `client/my-sites/themes/v2/hooks/use-theme-filters.ts`
- Create: `client/my-sites/themes/v2/hooks/test/use-theme-filters.test.ts`

**Step 1: Write failing tests**

Test cases:
- Returns empty object when no filters are loaded.
- Returns subject filters after they are dispatched to store.
- Returns `isLoaded: false` initially, `true` after filters are in store.

Reference existing selectors: `getThemeFilterTerms( state, 'subject' )` from `calypso/state/themes/selectors`.

**Step 2: Implement the hook**

```typescript
import { useSelector } from 'react-redux';
import { getThemeFilterTerms, getThemeFilters } from 'calypso/state/themes/selectors';

export function useThemeFilters() {
	const allFilters = useSelector( getThemeFilters );
	const subjectFilters = useSelector( ( state ) => getThemeFilterTerms( state, 'subject' ) );

	return {
		allFilters,
		subjectFilters: subjectFilters ?? {},
		isLoaded: Object.keys( allFilters ?? {} ).length > 0,
	};
}
```

Note: Theme filters are fetched by the SSR controller pipeline (`fetchThemeFilters` in `controller.jsx`). The hook reads from the store; it does not trigger fetching.

**Step 3: Run tests, verify pass. Commit**

```bash
git commit -m "feat(themes): add useThemeFilters data hook"
```

---

### Task 2.2: useThemeShowcaseUrl Hook

**Files:**
- Create: `client/my-sites/themes/v2/hooks/use-theme-showcase-url.ts`
- Create: `client/my-sites/themes/v2/hooks/test/use-theme-showcase-url.test.ts`

**Step 1: Write failing tests**

Test cases for URL parsing (reading current state from a URL string):
- `/themes` → `{ category: 'recommended', tier: '', filter: '', search: '' }`
- `/themes/all` → `{ category: 'all', ... }`
- `/themes/blog` → `{ category: 'blog', ... }`
- `/themes/free` → `{ tier: 'free', category: 'recommended', ... }` (disambiguated as tier)
- `/themes/blog/free` → `{ category: 'blog', tier: 'free', ... }`
- `/themes/blog/free/filter/feature:full-site-editing` → full parse
- `/themes?s=developer` → `{ search: 'developer', ... }`

Test cases for URL construction (building a URL from state):
- `{ category: 'blog', tier: 'free' }` → `/themes/blog/free`
- `{ category: 'recommended' }` → `/themes` (default omitted from URL)
- `{ tier: 'free', search: 'developer' }` → `/themes/free?s=developer`
- Changing category preserves existing non-UI filter in URL.

**Step 2: Implement**

Two pure functions: `parseThemeShowcaseUrl( pathname, search )` and `buildThemeShowcaseUrl( state )`.
One React hook: `useThemeShowcaseUrl()` — returns `{ currentState, navigate }`.

Known tier slugs for disambiguation: `free`, `premium`, `marketplace`, `partner`, `woocommerce`.

Reference existing logic in `client/my-sites/themes/helpers.js` and `client/my-sites/themes/validate-filters.js`.

**Step 3: Run tests, verify pass. Commit**

```bash
git commit -m "feat(themes): add useThemeShowcaseUrl hook for URL-driven filter state"
```

---

### Task 2.3: v2 Filter Bar — Category Pills

**Files:**
- Create: `client/my-sites/themes/v2/filter-bar/index.tsx`
- Create: `client/my-sites/themes/v2/filter-bar/style.scss`
- Create: `client/my-sites/themes/v2/filter-bar/test/index.test.tsx`

**Step 1: Write failing tests**

Test cases:
- Renders "Recommended" and "All" pills.
- Renders subject filter pills from the store.
- Clicking a pill navigates with the correct URL.
- Active category pill is visually highlighted.

**Step 2: Implement**

Use `Button` from `@wordpress/components`. Static categories ("Recommended", "All") + dynamic from `useThemeFilters()`. Clicking navigates via `useThemeShowcaseUrl()`. Horizontally scrollable on mobile.

```tsx
import { Button } from '@wordpress/components';
import { useThemeFilters } from '../hooks/use-theme-filters';
import { useThemeShowcaseUrl } from '../hooks/use-theme-showcase-url';

export default function FilterBar() {
	const { subjectFilters } = useThemeFilters();
	const { currentState, navigate } = useThemeShowcaseUrl();

	const staticCategories = [
		{ slug: 'recommended', label: 'Recommended' },
		{ slug: 'all', label: 'All' },
	];

	const categories = [
		...staticCategories,
		...Object.entries( subjectFilters ).map( ( [ slug, filter ] ) => ( {
			slug,
			label: filter.name,
		} ) ),
	];

	return (
		<div className="theme-showcase-v2-filter-bar">
			<div className="theme-showcase-v2-filter-bar__categories">
				{ categories.map( ( cat ) => (
					<Button
						key={ cat.slug }
						variant={ currentState.category === cat.slug ? 'primary' : 'secondary' }
						onClick={ () => navigate( { ...currentState, category: cat.slug } ) }
					>
						{ cat.label }
					</Button>
				) ) }
			</div>
		</div>
	);
}
```

**Step 3: Run tests, verify pass. Commit**

```bash
git commit -m "feat(themes): add category pills to v2 filter bar"
```

---

### Task 2.4: v2 Filter Bar — Plan Dropdown + Search

**Files:**
- Modify: `client/my-sites/themes/v2/filter-bar/index.tsx`
- Modify: `client/my-sites/themes/v2/filter-bar/test/index.test.tsx`

**Step 1: Add plan dropdown**

Options: All Plans, Free, Premium, Marketplace, Partner, WooCommerce. Use `SelectControl` or `CustomSelectControl` from `@wordpress/components`.

Test cases:
- Renders plan dropdown with all tier options.
- Selecting a plan updates the URL tier parameter.
- Current tier is reflected as the selected dropdown value.

**Step 2: Add search input**

Use `SearchControl` from `@wordpress/components`. Plain text only, updates `?s=` param.

Test cases:
- Renders a search input.
- Typing a search term and submitting updates the URL `?s=` param.
- Current search term from URL is reflected in the input.
- Clearing the search removes the `?s=` param.

**Step 3: Run tests, verify pass. Commit**

```bash
git commit -m "feat(themes): add plan dropdown and search to v2 filter bar"
```

---

### Task 2.5: Sticky Filter Bar + Integration

**Files:**
- Modify: `client/my-sites/themes/v2/filter-bar/style.scss`
- Modify: `client/my-sites/themes/v2/index.tsx`

**Step 1: Add sticky positioning**

CSS `position: sticky; top: 0; z-index: 10;` — no JavaScript scroll listeners.

**Step 2: Swap v1 filter bar for v2 in ThemeShowcaseV2**

The v2 filter bar replaces the v1 filter bar. The v1 theme grid/cards/pagination remain. The v2 filter bar drives the URL, which the v1 `ThemeShowcase` component already reads from props.

**Step 3: Verify end-to-end: category pills, plan dropdown, search all update URL and the v1 grid responds. Commit**

```bash
git commit -m "feat(themes): integrate v2 filter bar, replace v1 filter bar"
```

---

## Milestone 3: v2 Theme Cards + Grid

Goal: Replace the v1 theme cards and grid with the new design. The v2 filter bar (from Milestone 2) drives the data.

### Task 3.1: useThemes Data Hook

**Files:**
- Create: `client/my-sites/themes/v2/hooks/use-themes.ts`
- Create: `client/my-sites/themes/v2/hooks/test/use-themes.test.ts`

**Step 1: Write failing tests**

Test cases:
- Returns `{ data: [], isLoading: true, totalCount: 0 }` when no themes are loaded.
- Returns theme data after dispatch of `receiveThemes`.
- Dispatches `requestThemes` on mount.
- Re-fetches when query changes.

**Step 2: Implement the hook**

```typescript
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestThemes } from 'calypso/state/themes/actions';
import {
	getThemesForQuery,
	getThemesFoundForQuery,
	isRequestingThemesForQuery,
} from 'calypso/state/themes/selectors';

export interface ThemeQuery {
	search?: string;
	tier?: string;
	filter?: string;
	page?: number;
	number?: number;
	collection?: string;
}

export function useThemes( query: ThemeQuery ) {
	const dispatch = useDispatch();
	const siteId = 'wpcom';
	const stableQuery = useMemo( () => query, [ JSON.stringify( query ) ] );

	const data = useSelector( ( state ) => getThemesForQuery( state, siteId, stableQuery ) );
	const isLoading = useSelector( ( state ) =>
		isRequestingThemesForQuery( state, siteId, stableQuery )
	);
	const totalCount = useSelector( ( state ) =>
		getThemesFoundForQuery( state, siteId, stableQuery )
	);

	useEffect( () => {
		dispatch( requestThemes( siteId, stableQuery ) );
	}, [ dispatch, stableQuery ] );

	return { data: data ?? [], isLoading, totalCount: totalCount ?? 0 };
}
```

**Step 3: Run tests, verify pass. Commit**

```bash
git commit -m "feat(themes): add useThemes data hook"
```

---

### Task 3.2: ThemeCardV2 Shared Component

**Files:**
- Create: `packages/components/src/theme-card-v2/index.tsx`
- Create: `packages/components/src/theme-card-v2/style.scss`
- Create: `packages/components/src/theme-card-v2/test/index.test.tsx`
- Modify: `packages/components/src/index.ts` — export the new component

**Step 1: Write failing tests**

Test cases:
- Renders theme name and screenshot.
- Renders plan label when tier is provided.
- Does not render plan label for free themes.
- Hover state shows "Preview" button and "Live Demo" link.
- Calls `onPreview` when "Preview" button is clicked.
- "Live Demo" links to the demo URL.

**Step 2: Implement**

Built with `Card` and `Button` from `@wordpress/components`. Landscape thumbnail, 8px border radius, hover CTAs, plan label. See DESIGN.md Theme Cards section for full spec.

```tsx
import { Card, Button } from '@wordpress/components';
import clsx from 'clsx';

import './style.scss';

interface ThemeCardV2Props {
	name: string;
	slug: string;
	screenshotUrl: string;
	demoUrl?: string;
	tierLabel?: string;
	onPreview?: () => void;
	className?: string;
}

export default function ThemeCardV2( {
	name,
	slug,
	screenshotUrl,
	demoUrl,
	tierLabel,
	onPreview,
	className,
}: ThemeCardV2Props ) {
	return (
		<Card className={ clsx( 'theme-card-v2', className ) } size="small">
			<div className="theme-card-v2__thumbnail">
				<img
					src={ screenshotUrl }
					alt={ name }
					className="theme-card-v2__screenshot"
					loading="lazy"
				/>
				<div className="theme-card-v2__hover-actions">
					<Button variant="primary" onClick={ onPreview }>
						Preview
					</Button>
					{ demoUrl && (
						<Button variant="link" href={ demoUrl } target="_blank" rel="noopener noreferrer">
							Live Demo
						</Button>
					) }
				</div>
			</div>
			<div className="theme-card-v2__info">
				<span className="theme-card-v2__name">{ name }</span>
				{ tierLabel && <span className="theme-card-v2__tier">{ tierLabel }</span> }
			</div>
		</Card>
	);
}
```

Key styles: `border-radius: 8px`, hover overlay with opacity transition, landscape thumbnail preserving aspect ratio, plan label as subtle badge.

**Step 3: Run tests, verify pass. Export from packages/components. Commit**

```bash
git commit -m "feat(components): add ThemeCardV2 shared component"
```

---

### Task 3.3: v2 Theme Grid with Pagination

**Files:**
- Create: `client/my-sites/themes/v2/theme-grid/index.tsx`
- Create: `client/my-sites/themes/v2/theme-grid/style.scss`
- Create: `client/my-sites/themes/v2/theme-grid/test/index.test.tsx`

**Step 1: Write failing tests**

Test cases:
- Renders a grid of ThemeCardV2 components.
- Shows loading state when fetching.
- Shows correct number of theme cards.
- Responsive: 3 columns desktop, 2 tablet, 1 mobile.
- Infinite scroll: renders sentinel element when more pages are available.
- Does not render sentinel when on the last page.

**Step 2: Implement**

CSS grid with `ThemeCardV2` cards. Wired to `useThemes` hook. `IntersectionObserver` sentinel for infinite scroll. `gap: 24px`.

```scss
.theme-showcase-v2-grid {
	display: grid;
	grid-template-columns: repeat( 3, 1fr );
	gap: 24px;
	padding: 24px 0;

	@media ( max-width: 960px ) {
		grid-template-columns: repeat( 2, 1fr );
	}

	@media ( max-width: 600px ) {
		grid-template-columns: 1fr;
	}
}
```

**Step 3: Run tests, verify pass. Commit**

```bash
git commit -m "feat(themes): add v2 theme grid with pagination"
```

---

### Task 3.4: Replace v1 Grid with v2 Grid

**Files:**
- Modify: `client/my-sites/themes/v2/index.tsx`

**Step 1: Swap v1 `ThemesSelection` for v2 `ThemeGrid`**

Read filter state from `useThemeShowcaseUrl`, build query, pass to `ThemeGrid`. Remove the v1 `ConnectedThemeShowcase` wrapper.

```tsx
import { useThemeShowcaseUrl } from './hooks/use-theme-showcase-url';
import { DEFAULT_THEME_QUERY } from 'calypso/state/themes/constants';

export default function ThemeShowcaseV2( props ) {
	const { currentState } = useThemeShowcaseUrl();

	const query = {
		...DEFAULT_THEME_QUERY,
		search: currentState.search,
		tier: currentState.tier,
		filter: currentState.filter,
		collection: currentState.category === 'recommended' ? 'recommended' : undefined,
	};

	return (
		<Main fullWidthLayout isLoggedOut className="theme-showcase-v2">
			<Hero />
			<FilterBar />
			<FullWidthSection className="theme-showcase-v2__grid-section" enabled>
				<ThemeGrid query={ query } />
			</FullWidthSection>
		</Main>
	);
}
```

**Step 2: Verify end-to-end**

- Visit `/themes` → recommended themes in 3-column grid.
- Click category pill → grid refetches.
- Select tier → grid filters.
- Type in search → results filtered.
- Scroll down → more themes load.

**Step 3: Commit**

```bash
git commit -m "feat(themes): replace v1 theme grid with v2 in showcase"
```

---

## Milestone 4: Banners + Empty States + FAQs + Polish

Goal: Add the marketing/conversion layer and polish for production readiness.

### Task 4.1: AI Builder Banner

**Files:**
- Create: `client/my-sites/themes/v2/banners/ai-builder-banner.tsx`
- Create: `client/my-sites/themes/v2/banners/style.scss`

**Step 1: Implement the banner**

Reference the design post (section "4. Banners"): replaces the old "Design your own" Assembler banner. CTA links to the AI website builder flow.

Use `FullWidthSection` for full-width background. Use `@wordpress/components` Button for the CTA.

**Step 2: Commit**

```bash
git commit -m "feat(themes): add AI builder banner to v2 showcase"
```

---

### Task 4.2: DIFM Banner

**Files:**
- Create: `client/my-sites/themes/v2/banners/difm-banner.tsx`
- Modify: `client/my-sites/themes/v2/banners/style.scss`

**Step 1: Implement the banner**

Reference the design post: promotes "Built by WordPress.com" (DIFM). Copy aligned with the DIFM landing page. CTA links to DIFM landing page or flow.

**Step 2: Commit**

```bash
git commit -m "feat(themes): add DIFM banner to v2 showcase"
```

---

### Task 4.3: Contextual Plan Banners + Partner Themes Section

**Files:**
- Create: `client/my-sites/themes/v2/banners/plan-banner.tsx`
- Create: `client/my-sites/themes/v2/partner-themes/index.tsx`
- Create: `client/my-sites/themes/v2/partner-themes/style.scss`

**Step 1: Implement plan banners**

When filtering by tier, a contextual banner highlights features included in that plan. Different copy per tier. Props: `tier: string`.

**Step 2: Implement partner themes section**

Reuses `ThemeCardV2` with `useThemes` tier=partner query. Includes `PlanBanner` for partner pricing context.

**Step 3: Commit**

```bash
git commit -m "feat(themes): add plan banners and partner themes section"
```

---

### Task 4.4: Banner Interleaving

**Files:**
- Modify: `client/my-sites/themes/v2/index.tsx`

**Step 1: Interleave banners into the page**

Wire banners at defined positions between theme grid rows. AI banner after ~2 rows, DIFM further down. Plan banner conditional on active tier filter. Partner themes section when browsing partner tier. Banners hidden during search.

**Step 2: Verify locally, commit**

```bash
git commit -m "feat(themes): interleave banners into v2 showcase layout"
```

---

### Task 4.5: Search Results View + Empty State

**Files:**
- Modify: `client/my-sites/themes/v2/index.tsx`
- Create: `client/my-sites/themes/v2/empty-state/index.tsx`
- Create: `client/my-sites/themes/v2/empty-state/style.scss`
- Create: `client/my-sites/themes/v2/empty-state/test/index.test.tsx`

**Step 1: Handle search active state**

When search term is active: hero collapses, banners hidden, grid shows search results.

**Step 2: Implement empty state**

Three visual CTA cards:
- Build with AI → AI website builder flow URL.
- Hire an expert → DIFM landing page URL.
- Upload a theme → `/themes/upload`.

Test cases:
- Renders three CTA cards.
- Each card links to the correct destination.

Show empty state when `useThemes` returns `{ data: [], isLoading: false }`.

**Step 3: Run tests, verify pass. Commit**

```bash
git commit -m "feat(themes): add search results view and empty state"
```

---

### Task 4.6: FAQ Accordion

**Files:**
- Create: `client/my-sites/themes/v2/faqs/index.tsx`
- Create: `client/my-sites/themes/v2/faqs/style.scss`

**Step 1: Implement the FAQ accordion**

Use `@wordpress/components` Panel/PanelBody or native `<details>`/`<summary>` elements. FAQ data stored as a static array of question/answer pairs. Content to be finalized by content team.

**Step 2: Wire into ThemeShowcaseV2 at the bottom. Commit**

```bash
git commit -m "feat(themes): add FAQ section to v2 showcase"
```

---

### Task 4.7: SEO Content Refresh

**Files:**
- Create: `client/my-sites/themes/v2/hooks/use-theme-showcase-seo.ts`
- Modify: `client/my-sites/themes/v2/index.tsx`

**Step 1: Implement SEO hook**

v2 equivalent of `use-theme-showcase-logged-out-seo-content.js`. Sets `<title>` based on active category/tier/search, `og:description` with refreshed copy.

Reference existing hooks:
- `client/my-sites/themes/use-theme-showcase-title.js`
- `client/my-sites/themes/use-theme-showcase-description.js`
- `client/my-sites/themes/use-theme-showcase-logged-out-seo-content.js`

**Step 2: Commit**

```bash
git commit -m "feat(themes): refresh SEO content for v2 showcase"
```

---

### Task 4.8: Responsive Polish + Accessibility Audit

**Files:**
- Modify: various `style.scss` files across v2/

**Step 1: Audit responsive behavior**

Check all breakpoints:
- Desktop (> 960px): 3-column grid, full hero with illustration.
- Tablet (600-960px): 2-column grid, hero adjusts.
- Mobile (< 600px): 1-column grid, stacked hero, horizontally scrollable filter pills.

**Step 2: Accessibility audit**

Checklist:
- All interactive elements keyboard-navigable.
- Filter pills navigable via arrow keys.
- Theme card hover CTAs accessible via focus (show on focus, not just hover).
- Sticky filter bar doesn't trap focus.
- Search input has proper ARIA label.
- Theme grid has proper ARIA role.
- Color contrast meets WCAG AA (especially Blueberry accent on white).
- Screen reader announces filter changes.

**Step 3: Fix issues found. Commit**

```bash
git commit -m "fix(themes): polish responsive and accessibility in v2 showcase"
```

---

### Task 4.9: E2E Tests

**Files:**
- Create: Playwright test files (follow existing E2E directory structure)

**Step 1: Write Playwright E2E tests**

Test flows:
- Page loads with default "Recommended" themes visible.
- Clicking a category pill filters themes and updates the URL.
- Selecting a plan tier filters themes.
- Searching shows matching results.
- Searching with no results shows empty state with CTA cards.
- Scrolling down loads more themes (pagination).
- Clicking a theme card navigates to the theme detail page.

Reference existing E2E test patterns in the repo.

**Step 2: Run tests, verify pass. Commit**

```bash
git commit -m "test(themes): add E2E tests for v2 showcase"
```

---

## Nice-to-have: MSD Support

### Task MSD.1: Extend to MSD Users

**Files:**
- Modify: `client/my-sites/themes/v2/hooks/use-is-theme-showcase-v2-enabled.ts`
- Modify: `client/my-sites/themes/controller-logged-in.jsx` — add v2 branch in `renderThemes()`

**Step 1: Update the hook**

Add `hasDashboardOptIn` check, mirroring the Plugins LP pattern:

```typescript
export function useIsThemeShowcaseV2Enabled(): boolean {
	const siteId = useSelector( getSelectedSiteId );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const dashboardOptIn = useSelector( hasDashboardOptIn );

	if ( siteId ) {
		return false;
	}

	return isEnabled( 'themes/showcase-v2' ) && ( ! isLoggedIn || dashboardOptIn );
}
```

**Step 2: Update the controller**

In `controller-logged-in.jsx`, modify `renderThemes()` for MSD case (logged-in, no site selected, dashboard opt-in).

**Step 3: Adapt hero copy and CTAs**

MSD users are logged in — CTAs should say "Create a site" or "Select a site" rather than "Sign up". This may need a mode prop on the Hero component.

**Step 4: Test with masterbar navigation. Commit**

```bash
git commit -m "feat(themes): extend v2 showcase to MSD users"
```
