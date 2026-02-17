# Themes Landing Page v2 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the logged-out Themes landing page with a modern UI, unified layout with the Plugins LP, and refreshed messaging.

**Architecture:** A new `client/my-sites/themes/v2/` directory containing a `ThemeShowcaseV2` component gated behind a feature flag. Redux-backed custom hooks provide a portable data layer. Shared `ThemeCardV2` lives in `packages/components`. Reuses `FullWidthSection` from Plugins LP and `@wordpress/components` for UI primitives.

**Tech Stack:** React + TypeScript, Redux (via custom hooks), `@wordpress/components`, `@wordpress/base-styles`, `@wordpress/icons`, CSS/SCSS.

**Design doc:** `client/my-sites/themes/v2/DESIGN.md`

---

## Milestone 1: Foundation

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

Test file: `client/my-sites/themes/v2/hooks/test/use-is-theme-showcase-v2-enabled.test.ts`

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

Expected: FAIL — hook does not exist yet.

**Step 3: Implement the hook**

File: `client/my-sites/themes/v2/hooks/use-is-theme-showcase-v2-enabled.ts`

Follow the pattern from `client/my-sites/plugins/hooks/use-is-marketplace-redesign-enabled.ts`:

```typescript
import { isEnabled } from '@automattic/calypso-config';
import { useSelector } from 'react-redux';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Hook to determine if the Theme Showcase v2 should be rendered.
 *
 * Currently scoped to logged-out users only. Will be extended to MSD
 * (logged-in, no site selected) users in a future iteration.
 */
export function useIsThemeShowcaseV2Enabled(): boolean {
	const siteId = useSelector( getSelectedSiteId );
	const isLoggedIn = useSelector( isUserLoggedIn );

	if ( siteId ) {
		return false;
	}

	return isEnabled( 'themes/showcase-v2' ) && ! isLoggedIn;
}
```

Note: Unlike the Plugins hook, we do NOT check `hasDashboardOptIn` yet. MSD support is a nice-to-have milestone.

**Step 4: Run tests to verify they pass**

```bash
yarn test-client client/my-sites/themes/v2/hooks/test/use-is-theme-showcase-v2-enabled.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add client/my-sites/themes/v2/hooks/
git commit -m "feat(themes): add useIsThemeShowcaseV2Enabled hook"
```

---

### Task 1.3: useThemes Data Hook

**Files:**
- Create: `client/my-sites/themes/v2/hooks/use-themes.ts`
- Create: `client/my-sites/themes/v2/hooks/test/use-themes.test.ts`

**Step 1: Write the failing tests**

Test cases:
- Returns `{ data: [], isLoading: true, totalCount: 0 }` when no themes are loaded.
- Returns theme data after dispatch of `receiveThemes`.
- Dispatches `requestThemes` on mount.
- Re-fetches when query changes.

Use the same Redux store setup from `client/my-sites/themes/test/logged-out.jsx`: `createReduxStore()`, `setStore()`, `receiveThemes()`.

**Step 2: Run tests to verify they fail**

```bash
yarn test-client client/my-sites/themes/v2/hooks/test/use-themes.test.ts
```

**Step 3: Implement the hook**

File: `client/my-sites/themes/v2/hooks/use-themes.ts`

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

**Step 4: Run tests to verify they pass**

```bash
yarn test-client client/my-sites/themes/v2/hooks/test/use-themes.test.ts
```

**Step 5: Commit**

```bash
git add client/my-sites/themes/v2/hooks/use-themes.ts client/my-sites/themes/v2/hooks/test/use-themes.test.ts
git commit -m "feat(themes): add useThemes data hook"
```

---

### Task 1.4: useThemeFilters Data Hook

**Files:**
- Create: `client/my-sites/themes/v2/hooks/use-theme-filters.ts`
- Create: `client/my-sites/themes/v2/hooks/test/use-theme-filters.test.ts`

**Step 1: Write the failing tests**

Test cases:
- Returns empty object when no filters are loaded.
- Returns subject filters after they are dispatched to store.
- Returns tier options as a static list.

Reference existing selectors: `getThemeFilterTerms( state, 'subject' )` from `calypso/state/themes/selectors`.

**Step 2: Run tests, verify fail**

**Step 3: Implement the hook**

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

Note: Theme filters are fetched by the SSR controller pipeline (`fetchThemeFilters` in `controller.jsx`). The hook reads from the store; it does not trigger fetching. If we find that client-side navigation doesn't have filters loaded, we can add a `QueryThemeFilters` component later.

**Step 4: Run tests, verify pass**

**Step 5: Commit**

```bash
git add client/my-sites/themes/v2/hooks/use-theme-filters.ts client/my-sites/themes/v2/hooks/test/
git commit -m "feat(themes): add useThemeFilters data hook"
```

---

### Task 1.5: useThemeShowcaseUrl Hook

**Files:**
- Create: `client/my-sites/themes/v2/hooks/use-theme-showcase-url.ts`
- Create: `client/my-sites/themes/v2/hooks/test/use-theme-showcase-url.test.ts`

**Step 1: Write the failing tests**

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

Reference existing disambiguation logic in `client/my-sites/themes/helpers.js` and `client/my-sites/themes/validate-filters.js`.

**Step 2: Run tests, verify fail**

**Step 3: Implement the hook**

This hook has two parts:
1. `parseThemeShowcaseUrl( pathname, search )` — pure function, parses URL into state.
2. `buildThemeShowcaseUrl( state )` — pure function, builds URL from state.
3. `useThemeShowcaseUrl()` — React hook that reads from current page context and returns both current state and a navigate function.

Known tier slugs for disambiguation: `free`, `premium`, `marketplace`, `partner`, `woocommerce`.

The parse/build functions should be well-tested pure functions. The hook itself is a thin wrapper over `page()` navigation from `@automattic/calypso-router`.

**Step 4: Run tests, verify pass**

**Step 5: Commit**

```bash
git add client/my-sites/themes/v2/hooks/use-theme-showcase-url.ts client/my-sites/themes/v2/hooks/test/
git commit -m "feat(themes): add useThemeShowcaseUrl hook for URL-driven filter state"
```

---

### Task 1.6: ThemeShowcaseV2 Shell + Controller Integration

**Files:**
- Create: `client/my-sites/themes/v2/index.tsx`
- Create: `client/my-sites/themes/v2/style.scss`
- Modify: `client/my-sites/themes/controller.jsx` — add v2 branch in `loggedOut()`

**Step 1: Create the empty shell component**

File: `client/my-sites/themes/v2/index.tsx`

```tsx
import Main from 'calypso/components/main';

import './style.scss';

interface ThemeShowcaseV2Props {
	category?: string;
	tier?: string;
	filter?: string;
	vertical?: string;
	search?: string;
}

export default function ThemeShowcaseV2( props: ThemeShowcaseV2Props ) {
	return (
		<Main fullWidthLayout isLoggedOut className="theme-showcase-v2">
			<p>Theme Showcase v2 — Under Construction</p>
			<pre>{ JSON.stringify( props, null, 2 ) }</pre>
		</Main>
	);
}
```

File: `client/my-sites/themes/v2/style.scss`

```scss
.theme-showcase-v2 {
	// Base styles will be added as sections are built.
}
```

**Step 2: Integrate into the controller**

Modify `client/my-sites/themes/controller.jsx`, in the `loggedOut()` function.

The decision on whether to render v2 needs to happen at the controller level (not inside a React component) because the controller sets `context.primary`. We cannot use the React hook here — instead, check the feature flag directly with `isEnabled()`.

```jsx
// At the top of controller.jsx, add:
import { isEnabled } from '@automattic/calypso-config';
import ThemeShowcaseV2 from './v2';

// In the loggedOut() function, before rendering LoggedOutComponent:
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

Note: This renders v2 for ALL users when the flag is on. The `useIsThemeShowcaseV2Enabled` hook will be useful later when we need finer-grained control (e.g., MSD support), but at the controller level for logged-out, the feature flag is sufficient since `loggedOut()` is only called for logged-out users.

**Step 3: Verify locally**

```bash
yarn start
```

Visit `http://calypso.localhost:3000/themes` while logged out. You should see "Theme Showcase v2 — Under Construction" with the props JSON.

**Step 4: Commit**

```bash
git add client/my-sites/themes/v2/ client/my-sites/themes/controller.jsx
git commit -m "feat(themes): add ThemeShowcaseV2 shell with controller integration"
```

---

## Milestone 2: Hero + Navigation + Filter Bar

### Task 2.1: Logged-out Global Navigation

**Files:**
- Create: `client/my-sites/themes/v2/navigation/index.tsx`
- Create: `client/my-sites/themes/v2/navigation/style.scss`
- Modify: `client/my-sites/themes/v2/index.tsx` — add navigation section

**Step 1: Study the Plugins LP navigation**

Read these files to understand the logged-out navigation pattern used by the Plugins LP redesign:
- `client/my-sites/plugins/plugins-discovery-page/index.jsx` — look for the header/navigation rendering
- `client/layout/logged-out.jsx` — the logged-out layout shell

The navigation should match the Plugins LP logged-out header (WordPress.com logo, top-level links, CTA).

**Step 2: Implement the navigation component**

Use `@wordpress/components` where possible. The navigation should be consistent with the Plugins LP. If there is a shared logged-out navigation component already in use, reuse it. If not, build one and note that it should be extracted to a shared location in a future PR.

**Step 3: Wire into ThemeShowcaseV2**

Add the navigation as the first child in `ThemeShowcaseV2`.

**Step 4: Verify locally, commit**

```bash
git add client/my-sites/themes/v2/navigation/
git commit -m "feat(themes): add logged-out global navigation to v2 showcase"
```

---

### Task 2.2: Hero Section

**Files:**
- Create: `client/my-sites/themes/v2/hero/index.tsx`
- Create: `client/my-sites/themes/v2/hero/style.scss`
- Modify: `client/my-sites/themes/v2/index.tsx`

**Step 1: Implement the hero component**

Reference the design post (section "1. Hero"):
- Illustration for visual alignment with Plugins LP
- Updated copy (from the design — coordinate with design/content team for final strings)
- Blueberry as the lead accent color
- Grid layout consistent with Plugins LP

Use `FullWidthSection` (from `client/components/full-width-section`) to wrap the hero for full-width background.

```tsx
import FullWidthSection from 'calypso/components/full-width-section';

export default function Hero() {
	return (
		<FullWidthSection className="theme-showcase-v2-hero" enabled>
			<div className="theme-showcase-v2-hero__content">
				<div className="theme-showcase-v2-hero__text">
					<h1>{ /* Updated heading copy */ }</h1>
					<p>{ /* Updated subheading copy */ }</p>
				</div>
				<div className="theme-showcase-v2-hero__illustration">
					{ /* Illustration asset — coordinate with design for SVG/image */ }
				</div>
			</div>
		</FullWidthSection>
	);
}
```

Use `@wordpress/base-styles` design tokens for spacing, colors, and typography where available.

**Step 2: Style the hero**

SCSS file should use Blueberry accent. Use logical properties (`margin-inline-start`, etc.). Responsive breakpoints for mobile/tablet.

**Step 3: Wire into ThemeShowcaseV2, verify locally, commit**

```bash
git add client/my-sites/themes/v2/hero/
git commit -m "feat(themes): add hero section to v2 showcase"
```

---

### Task 2.3: Filter Bar — Category Pills

**Files:**
- Create: `client/my-sites/themes/v2/filter-bar/index.tsx`
- Create: `client/my-sites/themes/v2/filter-bar/style.scss`
- Create: `client/my-sites/themes/v2/filter-bar/test/index.test.tsx`

**Step 1: Write the failing tests**

Test cases:
- Renders "Recommended" and "All" pills.
- Renders subject filter pills from the store (e.g., "Blog", "Business").
- Clicking a pill calls navigation with the correct URL.
- The active category pill is visually highlighted.

**Step 2: Run tests, verify fail**

**Step 3: Implement the filter bar**

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

The exact styling of the pills (as rounded pills, not rectangular buttons) will need CSS overrides on the `@wordpress/components` Button. Check whether the Plugins LP has a similar pattern to follow.

**Step 4: Run tests, verify pass. Commit**

```bash
git add client/my-sites/themes/v2/filter-bar/
git commit -m "feat(themes): add category pills to v2 filter bar"
```

---

### Task 2.4: Filter Bar — Plan Dropdown

**Files:**
- Modify: `client/my-sites/themes/v2/filter-bar/index.tsx`
- Modify: `client/my-sites/themes/v2/filter-bar/test/index.test.tsx`

**Step 1: Write failing tests**

Test cases:
- Renders plan dropdown with options: All Plans, Free, Premium, Marketplace, Partner, WooCommerce.
- Selecting a plan updates the URL tier parameter.
- Current tier is reflected as the selected dropdown value.

**Step 2: Implement the plan dropdown**

Add a `SelectControl` (from `@wordpress/components`) or `CustomSelectControl` next to the category pills.

Plan tiers (from the existing system):
```typescript
const PLAN_TIERS = [
	{ slug: '', label: 'All Plans' },
	{ slug: 'free', label: 'Free' },
	{ slug: 'premium', label: 'Premium' },
	{ slug: 'marketplace', label: 'Marketplace' },
	{ slug: 'partner', label: 'Partner' },
	{ slug: 'woocommerce', label: 'WooCommerce' },
];
```

Reference the design post (section "2. Filters") — the dropdown has been refined as a plan filter. The existing `custom-select-wrapper.tsx` in the current themes code already uses `CustomSelectControl` from `@wordpress/components`, follow that pattern.

**Step 3: Run tests, verify pass. Commit**

```bash
git commit -m "feat(themes): add plan dropdown to v2 filter bar"
```

---

### Task 2.5: Filter Bar — Search Input

**Files:**
- Modify: `client/my-sites/themes/v2/filter-bar/index.tsx`
- Modify: `client/my-sites/themes/v2/filter-bar/test/index.test.tsx`

**Step 1: Write failing tests**

Test cases:
- Renders a search input.
- Typing a search term and submitting updates the URL `?s=` param.
- Current search term from URL is reflected in the input.
- Clearing the search removes the `?s=` param.

**Step 2: Implement search**

Use `SearchControl` from `@wordpress/components`. Plain text only — no `filter:value` syntax parsing.

**Step 3: Run tests, verify pass. Commit**

```bash
git commit -m "feat(themes): add search input to v2 filter bar"
```

---

### Task 2.6: Sticky Filter Bar

**Files:**
- Modify: `client/my-sites/themes/v2/filter-bar/style.scss`

**Step 1: Add sticky positioning**

```scss
.theme-showcase-v2-filter-bar {
	position: sticky;
	top: 0;
	z-index: 10;
	background-color: var( --color-surface );
}
```

Test manually: scroll down on the page, the filter bar should stick to the top.

Ensure the sticky bar does not cover the hero — it should only stick once the user scrolls past the hero. This is handled naturally by `position: sticky` if the filter bar comes after the hero in the DOM.

**Step 2: Commit**

```bash
git commit -m "feat(themes): make filter bar sticky on scroll"
```

---

### Task 2.7: Wire Hero + Filter Bar into ThemeShowcaseV2

**Files:**
- Modify: `client/my-sites/themes/v2/index.tsx`

**Step 1: Assemble the components**

```tsx
import Main from 'calypso/components/main';
import Hero from './hero';
import FilterBar from './filter-bar';

import './style.scss';

export default function ThemeShowcaseV2( props ) {
	return (
		<Main fullWidthLayout isLoggedOut className="theme-showcase-v2">
			<Hero />
			<FilterBar />
			{ /* Theme grid will go here in Milestone 3 */ }
		</Main>
	);
}
```

**Step 2: Verify locally**

Visit `/themes` logged out. Hero, navigation, and filter bar should render. Clicking category pills and changing the plan dropdown should update the URL. Search should update `?s=`.

**Step 3: Commit**

```bash
git commit -m "feat(themes): assemble hero + filter bar in v2 showcase"
```

---

## Milestone 3: Theme Cards + Grid

### Task 3.1: ThemeCardV2 Shared Component

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

**Step 2: Run tests, verify fail**

```bash
yarn test-client packages/components/src/theme-card-v2/test/index.test.tsx
```

**Step 3: Implement the component**

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

**Step 4: Style the card**

Key styles:
- `border-radius: 8px` on the card
- Hover state: overlay with actions (opacity transition)
- Landscape thumbnail preserving aspect ratio
- Plan label styled as a subtle badge

**Step 5: Run tests, verify pass. Export from packages/components. Commit**

```bash
git add packages/components/src/theme-card-v2/
git commit -m "feat(components): add ThemeCardV2 shared component"
```

---

### Task 3.2: Theme Grid Component

**Files:**
- Create: `client/my-sites/themes/v2/theme-grid/index.tsx`
- Create: `client/my-sites/themes/v2/theme-grid/style.scss`
- Create: `client/my-sites/themes/v2/theme-grid/test/index.test.tsx`

**Step 1: Write failing tests**

Test cases:
- Renders a grid of ThemeCardV2 components.
- Shows loading state when themes are being fetched.
- Shows correct number of theme cards.
- Renders "No themes match your search" when data is empty and not loading.

**Step 2: Implement the grid**

```tsx
import { Spinner } from '@wordpress/components';
import ThemeCardV2 from '@automattic/components/src/theme-card-v2';
import { useThemes } from '../hooks/use-themes';

interface ThemeGridProps {
	query: ThemeQuery;
}

export default function ThemeGrid( { query }: ThemeGridProps ) {
	const { data: themes, isLoading, totalCount } = useThemes( query );

	if ( isLoading && themes.length === 0 ) {
		return <Spinner />;
	}

	if ( ! isLoading && themes.length === 0 ) {
		return null; // Empty state handled by parent
	}

	return (
		<div className="theme-showcase-v2-grid">
			{ themes.map( ( theme ) => (
				<ThemeCardV2
					key={ theme.id }
					name={ theme.name }
					slug={ theme.id }
					screenshotUrl={ theme.screenshot }
					demoUrl={ theme.demo_uri }
					tierLabel={ theme.price || undefined }
					onPreview={ () => {
						// Navigate to /theme/{slug} — wire up in integration step
					} }
				/>
			) ) }
		</div>
	);
}
```

**Step 3: Style as 3-column responsive grid**

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

**Step 4: Run tests, verify pass. Commit**

```bash
git add client/my-sites/themes/v2/theme-grid/
git commit -m "feat(themes): add theme grid component to v2 showcase"
```

---

### Task 3.3: Pagination

**Files:**
- Modify: `client/my-sites/themes/v2/theme-grid/index.tsx`
- Modify: `client/my-sites/themes/v2/theme-grid/test/index.test.tsx`

**Step 1: Add pagination / infinite scroll**

The current showcase uses infinite scroll (loads more themes as the user scrolls down). Follow the same pattern: track current page in local state, increment when the user reaches the bottom, and pass updated `page` to `useThemes`.

Use an `IntersectionObserver` on a sentinel element at the bottom of the grid to trigger loading the next page.

Test cases:
- Renders a loading indicator at the bottom when more pages are available.
- Does not render loading indicator when on the last page (`themes.length >= totalCount`).

**Step 2: Implement, test, commit**

```bash
git commit -m "feat(themes): add infinite scroll pagination to v2 grid"
```

---

### Task 3.4: Wire Grid into ThemeShowcaseV2

**Files:**
- Modify: `client/my-sites/themes/v2/index.tsx`

**Step 1: Connect filter state to grid query**

The showcase reads the current filter/search state from `useThemeShowcaseUrl` and passes it as a query to `ThemeGrid`.

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

**Step 2: Verify end-to-end locally**

- Visit `/themes` → should show recommended themes in 3-column grid.
- Click "Blog" category pill → URL changes, grid refetches with blog filter.
- Select "Free" in plan dropdown → URL changes, grid shows free themes.
- Type in search → themes filtered by keyword.
- Scroll down → more themes load.

**Step 3: Commit**

```bash
git commit -m "feat(themes): wire filter state to theme grid in v2 showcase"
```

---

## Milestone 4: Banners + Partner Themes

### Task 4.1: AI Builder Banner

**Files:**
- Create: `client/my-sites/themes/v2/banners/ai-builder-banner.tsx`
- Create: `client/my-sites/themes/v2/banners/style.scss`

**Step 1: Implement the banner**

Reference the design post (section "4. Banners"): replaces the old "Design your own" Assembler banner. CTA links to the AI website builder flow.

Use `FullWidthSection` for full-width background. Use `@wordpress/components` Button for the CTA.

The AI builder flow URL will need to be confirmed — check the current "Design your own" banner for the existing URL pattern, and coordinate with the AI builder team for the new one.

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

Reference the design post: promotes "Built by WordPress.com" (DIFM). Copy aligned with the DIFM landing page.

The CTA should link to the DIFM landing page or flow.

**Step 2: Commit**

```bash
git commit -m "feat(themes): add DIFM banner to v2 showcase"
```

---

### Task 4.3: Contextual Plan Banners

**Files:**
- Create: `client/my-sites/themes/v2/banners/plan-banner.tsx`
- Modify: `client/my-sites/themes/v2/banners/style.scss`

**Step 1: Implement the plan banner**

Reference the design post: when filtering by plan, a contextual banner highlights the features included in that plan. Different copy per tier.

Props:
- `tier: string` — which plan tier is active.

The banner renders only when a tier filter is active. Content varies per tier. Coordinate with content team for final copy per plan.

**Step 2: Commit**

```bash
git commit -m "feat(themes): add contextual plan banners to v2 showcase"
```

---

### Task 4.4: Partner Themes Section

**Files:**
- Create: `client/my-sites/themes/v2/partner-themes/index.tsx`
- Create: `client/my-sites/themes/v2/partner-themes/style.scss`

**Step 1: Implement**

Reference the design post: Partner themes are displayed in landscape format with contextual pricing banners. This is a separate section from the main grid, shown when viewing partner themes.

Reuse `ThemeCardV2` for the cards. Use `useThemes` with `tier: 'partner'` query. Include the `PlanBanner` for partner pricing context.

**Step 2: Commit**

```bash
git commit -m "feat(themes): add partner themes section to v2 showcase"
```

---

### Task 4.5: Banner Interleaving in ThemeShowcaseV2

**Files:**
- Modify: `client/my-sites/themes/v2/index.tsx`

**Step 1: Interleave banners into the page**

The showcase renders banners at defined positions between theme grid rows. The exact positions will follow the design (e.g., AI banner after ~2 rows, DIFM further down).

The plan banner is conditional on the active tier filter. Partner themes section shows when browsing partner tier.

**Step 2: Verify locally, commit**

```bash
git commit -m "feat(themes): interleave banners into v2 showcase layout"
```

---

## Milestone 5: Search & Empty States

### Task 5.1: Search Results View

**Files:**
- Modify: `client/my-sites/themes/v2/index.tsx`

**Step 1: Handle search active state**

When a search term is active (`?s=` param):
- Hero collapses or simplifies (check with design whether it hides entirely or shows a reduced version).
- Banners are hidden during search.
- Grid shows search results normally.

**Step 2: Commit**

```bash
git commit -m "feat(themes): handle search results view in v2 showcase"
```

---

### Task 5.2: Empty State

**Files:**
- Create: `client/my-sites/themes/v2/empty-state/index.tsx`
- Create: `client/my-sites/themes/v2/empty-state/style.scss`
- Create: `client/my-sites/themes/v2/empty-state/test/index.test.tsx`

**Step 1: Write failing tests**

Test cases:
- Renders three CTA cards: Build with AI, Hire an expert, Upload a theme.
- Each card links to the correct destination.

**Step 2: Implement the empty state**

Reference the design post (section "5. Search results"): three visual cards. Use `@wordpress/components` Card + Button.

Destinations:
- Build with AI → AI website builder flow URL
- Hire an expert → DIFM landing page URL
- Upload a theme → `/themes/upload`

**Step 3: Wire into ThemeShowcaseV2**

Show the empty state when `useThemes` returns `{ data: [], isLoading: false }`.

**Step 4: Run tests, verify pass. Commit**

```bash
git commit -m "feat(themes): add empty state with CTA cards to v2 showcase"
```

---

## Milestone 6: FAQs + SEO + Polish

### Task 6.1: FAQ Section

**Files:**
- Create: `client/my-sites/themes/v2/faqs/index.tsx`
- Create: `client/my-sites/themes/v2/faqs/style.scss`

**Step 1: Implement the FAQ accordion**

Use `@wordpress/components` Panel/PanelBody for the accordion, or native `<details>`/`<summary>` elements styled consistently.

FAQ data stored as a static array:

```typescript
const FAQ_ITEMS = [
	{
		question: translate( 'What is a WordPress theme?' ),
		answer: translate( '...' ),
	},
	// ... more items, content TBD by content team
];
```

**Step 2: Wire into ThemeShowcaseV2 at the bottom of the page. Commit**

```bash
git commit -m "feat(themes): add FAQ section to v2 showcase"
```

---

### Task 6.2: SEO — Meta Tags and Canonical URLs

**Files:**
- Create: `client/my-sites/themes/v2/hooks/use-theme-showcase-seo.ts`
- Modify: `client/my-sites/themes/v2/index.tsx`

**Step 1: Implement SEO hook**

Reference the existing SEO hooks:
- `client/my-sites/themes/use-theme-showcase-title.js`
- `client/my-sites/themes/use-theme-showcase-description.js`
- `client/my-sites/themes/use-theme-showcase-logged-out-seo-content.js`

Create a v2 equivalent that:
- Sets `<title>` based on active category/tier/search.
- Sets `og:description` with refreshed copy.
- Outputs the logged-out SEO body content (if still needed for the new design — the hero may replace this).

The controller-level SEO setup (hrefLang, canonical URL) in `index.node.js` should continue to work unchanged since the SSR pipeline runs before the component renders.

**Step 2: Commit**

```bash
git commit -m "feat(themes): add SEO meta tags to v2 showcase"
```

---

### Task 6.3: Responsive Behavior

**Files:**
- Modify: various `style.scss` files across v2/

**Step 1: Audit and fix responsive behavior**

Check all breakpoints:
- Desktop (> 960px): 3-column grid, full hero with illustration.
- Tablet (600-960px): 2-column grid, hero adjusts.
- Mobile (< 600px): 1-column grid, stacked hero, full-width filter pills (horizontally scrollable).

Filter bar pills should be horizontally scrollable on mobile (no overflow hidden).

**Step 2: Commit**

```bash
git commit -m "fix(themes): polish responsive behavior in v2 showcase"
```

---

### Task 6.4: Accessibility Audit

**Files:**
- Modify: various components across v2/

**Step 1: Audit**

Checklist:
- [ ] All interactive elements are keyboard-navigable (tab order makes sense).
- [ ] Filter pills navigable via arrow keys.
- [ ] Theme card hover CTAs accessible via focus (show on focus, not just hover).
- [ ] Sticky filter bar doesn't trap focus.
- [ ] Search input has proper ARIA label.
- [ ] Theme grid has proper ARIA role (e.g., `role="list"` or semantic list).
- [ ] Color contrast meets WCAG AA (especially Blueberry accent on white).
- [ ] Screen reader announces filter changes.

**Step 2: Fix issues found. Commit**

```bash
git commit -m "fix(themes): accessibility improvements in v2 showcase"
```

---

### Task 6.5: E2E Tests

**Files:**
- Create: `test/e2e/specs/themes-showcase-v2/` (or follow existing E2E test directory structure)

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

### Task MSD.1: Extend Feature Flag

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

In `controller-logged-in.jsx`, modify `renderThemes()` to check the feature flag for the MSD case (logged-in, no site selected, dashboard opt-in):

```jsx
export function renderThemes( context, next ) {
	const state = context.store.getState();
	const selectedSite = getSelectedSiteId( state );
	const dashboardOptIn = hasDashboardOptIn( state );

	// V2 showcase for MSD users (logged-in, no site, dashboard opt-in)
	if ( isEnabled( 'themes/showcase-v2' ) && ! selectedSite && dashboardOptIn ) {
		const props = getProps( context );
		context.primary = <ThemeShowcaseV2 { ...props } />;
		return next();
	}

	const shouldUseLoggedIn =
		isEnabled( 'themes/universal-header' ) && dashboardOptIn
			? selectedSite
			: isUserLoggedIn( state );
	if ( shouldUseLoggedIn ) {
		return loggedIn( context, next );
	}

	return loggedOut( context, next );
}
```

**Step 3: Adapt hero copy and CTAs**

MSD users are logged in — CTAs should say "Create a site" or "Select a site" rather than "Sign up". This may need a mode prop on the Hero component.

**Step 4: Test with masterbar navigation. Commit**

```bash
git commit -m "feat(themes): extend v2 showcase to MSD users"
```
