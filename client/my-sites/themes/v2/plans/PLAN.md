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
- Modify: `config/development.json`
- Modify: `config/test.json`
- Modify: `config/production.json`
- Modify: `config/stage.json`
- Modify: `config/horizon.json`
- Modify: `config/wpcalypso.json`
- Modify: `config/dashboard-development.json`
- Modify: `config/dashboard-horizon.json`
- Modify: `config/dashboard-production.json`
- Modify: `config/dashboard-stage.json`

**Step 1: Add the feature flag to all config files**

In each file, find the `"features"` object and add `"themes/showcase-v2"`. Place it alphabetically near the existing `"marketplace-redesign"` key.

Set to `true` in `development.json` and `test.json` only. Set to `false` in all other files.

Example (in `config/development.json`, inside `"features"`):

```json
"themes/showcase-v2": true,
```

Example (in `config/production.json`, inside `"features"`):

```json
"themes/showcase-v2": false,
```

**Step 2: Verify**

```bash
grep -r "themes/showcase-v2" config/
```

Expected: 10 files, 2 with `true`, 8 with `false`.

**Step 3: Commit**

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

Create `client/my-sites/themes/v2/hooks/test/use-is-theme-showcase-v2-enabled.test.ts`:

```typescript
/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { renderHook } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import { setStore } from 'calypso/state/redux-store';
import { useIsThemeShowcaseV2Enabled } from '../use-is-theme-showcase-v2-enabled';

jest.mock( '@automattic/calypso-config', () => {
	const original = jest.requireActual( '@automattic/calypso-config' );
	return {
		...original,
		isEnabled: jest.fn(),
	};
} );

function renderWithStore( storeState: Record< string, unknown > = {} ) {
	const store = createReduxStore(
		{
			currentUser: { id: null },
			ui: { selectedSiteId: null },
			...storeState,
		},
		( state: unknown ) => state
	);
	setStore( store );

	return renderHook( () => useIsThemeShowcaseV2Enabled(), {
		wrapper: ( { children } ) => (
			<ReduxProvider store={ store }>{ children }</ReduxProvider>
		),
	} );
}

describe( 'useIsThemeShowcaseV2Enabled', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'returns true when feature flag is on and user is logged out', () => {
		( config.isEnabled as jest.Mock ).mockReturnValue( true );
		const { result } = renderWithStore( { currentUser: { id: null } } );
		expect( result.current ).toBe( true );
	} );

	test( 'returns false when feature flag is off', () => {
		( config.isEnabled as jest.Mock ).mockReturnValue( false );
		const { result } = renderWithStore( { currentUser: { id: null } } );
		expect( result.current ).toBe( false );
	} );

	test( 'returns false when user is logged in', () => {
		( config.isEnabled as jest.Mock ).mockReturnValue( true );
		const { result } = renderWithStore( {
			currentUser: { id: 123, user: { ID: 123 } },
		} );
		expect( result.current ).toBe( false );
	} );

	test( 'returns false when a site is selected', () => {
		( config.isEnabled as jest.Mock ).mockReturnValue( true );
		const { result } = renderWithStore( {
			currentUser: { id: null },
			ui: { selectedSiteId: 456 },
		} );
		expect( result.current ).toBe( false );
	} );
} );
```

Note: The exact Redux state shape for `currentUser` may need adjusting based on how `isUserLoggedIn` reads the state. The selector checks `state.currentUser.id` — when it's falsy, the user is logged out. Run the tests and adjust if the selector reads differently.

**Step 2: Run tests to verify they fail**

```bash
yarn test-client client/my-sites/themes/v2/hooks/test/use-is-theme-showcase-v2-enabled.test.ts
```

Expected: FAIL — the hook doesn't exist yet.

**Step 3: Implement the hook**

Create `client/my-sites/themes/v2/hooks/use-is-theme-showcase-v2-enabled.ts`:

```typescript
import { isEnabled } from '@automattic/calypso-config';
import { useSelector } from 'react-redux';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Whether the v2 Theme Showcase should be rendered.
 *
 * True when the feature flag is on, the user is logged out, and no site is selected.
 * Mirrors the pattern in `use-is-marketplace-redesign-enabled.ts`.
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

**Step 4: Run tests to verify they pass**

```bash
yarn test-client client/my-sites/themes/v2/hooks/test/use-is-theme-showcase-v2-enabled.test.ts
```

Expected: 4 tests PASS.

**Step 5: Lint**

```bash
yarn eslint client/my-sites/themes/v2/hooks/use-is-theme-showcase-v2-enabled.ts
yarn eslint client/my-sites/themes/v2/hooks/test/use-is-theme-showcase-v2-enabled.test.ts
```

**Step 6: Commit**

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

**Step 1: Create the v2 style file**

Create `client/my-sites/themes/v2/style.scss`:

```scss
.theme-showcase-v2 {
	// Override the default Main component max-width for full-width layout.
	&.main.is-logged-out {
		max-width: none;
		padding: 0;
	}
}

.theme-showcase-v2__content {
	// Let the v1 ThemeShowcase use its own internal layout.
	// This wrapper just provides the full-width background.
}
```

**Step 2: Create the v2 shell component**

Create `client/my-sites/themes/v2/index.tsx`:

The v2 shell wraps the existing v1 `connectOptions( ThemeShowcase )` — the exact same component that `client/my-sites/themes/logged-out.jsx` renders. The only difference is the wrapping layout.

```tsx
import FullWidthSection from 'calypso/components/full-width-section';
import Main from 'calypso/components/main';
import { connectOptions } from '../theme-options';
import ThemeShowcase from '../theme-showcase';

import './style.scss';

const ConnectedThemeShowcase = connectOptions( ThemeShowcase );

export default function ThemeShowcaseV2( props: Record< string, unknown > ) {
	return (
		<Main fullWidthLayout isLoggedOut className="theme-showcase-v2">
			{ /* Hero section will be added in Task 1.5 */ }
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

The props passed to `ConnectedThemeShowcase` match exactly what `logged-out.jsx` passes. Reference: `client/my-sites/themes/logged-out.jsx`.

The `props` spread from the controller include: `category`, `tier`, `filter`, `vertical`, `analyticsPageTitle`, `analyticsPath`, `search` (from `?s=`), `isCollectionView`, `pathName`, `trackScrollPage`. Reference: `getProps()` in `client/my-sites/themes/controller.jsx:15-36`.

**Step 3: Integrate into the controller**

Modify `client/my-sites/themes/controller.jsx`:

1. Add import at the top, after the existing imports:

```jsx
import { isEnabled } from '@automattic/calypso-config';
import ThemeShowcaseV2 from './v2';
```

2. Replace the `loggedOut` function body. The current function (lines 38-49) is:

```jsx
export function loggedOut( context, next ) {
	performanceMark( context, 'themesLoggedOut' );
	if ( context.isServerSide && Object.keys( context.query ).length > 0 ) {
		return next();
	}

	const props = getProps( context );

	context.primary = <LoggedOutComponent { ...props } />;
	next();
}
```

Replace with:

```jsx
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

**Step 4: Verify locally**

```bash
yarn start
```

Visit `http://calypso.localhost:3000/themes` while logged out (open an incognito/private window). You should see the existing theme showcase wrapped in the new v2 layout shell. The page should be fully functional — same themes, same filters, same search — just with a different outer wrapper.

Verify these URLs still work:
- `http://calypso.localhost:3000/themes`
- `http://calypso.localhost:3000/themes/blog`
- `http://calypso.localhost:3000/themes/free`
- `http://calypso.localhost:3000/themes?s=developer`

**Step 5: Lint**

```bash
yarn eslint client/my-sites/themes/v2/index.tsx
yarn eslint client/my-sites/themes/controller.jsx
yarn stylelint client/my-sites/themes/v2/style.scss
```

**Step 6: Commit**

```bash
git add client/my-sites/themes/v2/index.tsx client/my-sites/themes/v2/style.scss client/my-sites/themes/controller.jsx
git commit -m "feat(themes): add ThemeShowcaseV2 shell wrapping v1 internals"
```

---

### Task 1.4: Update Logged-out Global Navigation

The logged-out layout already renders a `UniversalNavbarHeader` and `UniversalNavbarFooter` for themes pages (see `client/layout/logged-out.jsx:327-330`). The `sectionName` for themes is `'themes'`, and the layout already includes both header and footer for this section.

**Step 1: Verify the existing navigation works**

Visit `http://calypso.localhost:3000/themes` logged out. The `UniversalNavbarHeader` (WordPress.com logo, top-level links, "Get Started" CTA) and `UniversalNavbarFooter` should already be rendered by the logged-out layout wrapper.

If the header/footer are already rendering correctly with the v2 shell from Task 1.3, **this task is done — no new files needed.**

The Plugins LP (`client/my-sites/plugins/plugins-discovery-page/index.jsx`) doesn't create its own navigation component either — it relies on the same logged-out layout. The `FullWidthSection` in the Plugins LP only wraps content sections, not the nav.

**Step 2: If navigation is NOT rendering correctly**

This would mean the v2 shell is somehow bypassing the logged-out layout. In that case:

1. Check that the controller pipeline (`client/my-sites/themes/index.node.js` or `index.web.js`) still uses the logged-out layout for the themes section.
2. The fix would be in the controller/routing layer, not in creating a new navigation component.

**Step 3: Commit (if any changes were needed)**

```bash
git add client/my-sites/themes/
git commit -m "feat(themes): verify logged-out global navigation works with v2 showcase"
```

---

### Task 1.5: Hero Section

**Files:**
- Create: `client/my-sites/themes/v2/hero/index.tsx`
- Create: `client/my-sites/themes/v2/hero/style.scss`
- Modify: `client/my-sites/themes/v2/index.tsx`
- Modify: `client/my-sites/themes/v2/style.scss`

**Step 1: Implement the hero component**

Create `client/my-sites/themes/v2/hero/index.tsx`:

Reference the design post at `https://wpbranddesign.wordpress.com/2025/09/25/themes-lp/` (section "1. Hero"). The hero has a headline, subheadline, CTA button, and an illustration on the right.

```tsx
import { useTranslate } from 'i18n-calypso';
import { Button } from '@wordpress/components';

import './style.scss';

export default function Hero() {
	const translate = useTranslate();

	return (
		<div className="theme-showcase-v2-hero">
			<div className="theme-showcase-v2-hero__content">
				<h1 className="theme-showcase-v2-hero__title">
					{ translate( 'Starter themes to build a beautiful website' ) }
				</h1>
				<p className="theme-showcase-v2-hero__subtitle">
					{ translate(
						'Choose from hundreds of community designs, or start with a blank canvas. Then customize every detail with the power of WordPress.'
					) }
				</p>
				<Button
					className="theme-showcase-v2-hero__cta"
					variant="primary"
					href="/start"
				>
					{ translate( 'Get started' ) }
				</Button>
			</div>
			<div className="theme-showcase-v2-hero__illustration">
				{ /* Illustration placeholder — replace with final asset from design.
				     Check the design post for the correct SVG/image. */ }
			</div>
		</div>
	);
}
```

Note: The exact copy should be confirmed with the design/content team. The strings above are placeholder copy based on the design post. Use `translate()` for all user-visible strings.

**Step 2: Add hero styles**

Create `client/my-sites/themes/v2/hero/style.scss`:

```scss
.theme-showcase-v2-hero {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 48px;
	max-width: 1280px;
	margin: 0 auto;
	padding: 64px 24px;

	@media ( max-width: 960px ) {
		flex-direction: column;
		text-align: center;
		gap: 32px;
		padding: 48px 24px;
	}
}

.theme-showcase-v2-hero__content {
	flex: 1;
	max-width: 560px;

	@media ( max-width: 960px ) {
		max-width: none;
	}
}

.theme-showcase-v2-hero__title {
	font-size: 2.75rem;
	font-weight: 400;
	line-height: 1.2;
	margin: 0 0 16px;
	letter-spacing: -0.02em;

	@media ( max-width: 960px ) {
		font-size: 2rem;
	}

	@media ( max-width: 600px ) {
		font-size: 1.75rem;
	}
}

.theme-showcase-v2-hero__subtitle {
	font-size: 1.125rem;
	line-height: 1.6;
	color: var( --studio-gray-60 );
	margin: 0 0 24px;
}

.theme-showcase-v2-hero__cta {
	// Uses @wordpress/components Button with variant="primary".
	// Blueberry accent color can be set via CSS custom property if needed:
	// --wp-components-color-accent: var( --studio-blueberry );
}

.theme-showcase-v2-hero__illustration {
	flex: 1;
	max-width: 560px;

	@media ( max-width: 960px ) {
		max-width: 400px;
	}

	img {
		width: 100%;
		height: auto;
	}
}
```

**Step 3: Wire hero into ThemeShowcaseV2**

Modify `client/my-sites/themes/v2/index.tsx`:

1. Add import:

```tsx
import Hero from './hero';
```

2. Add the Hero component inside the Main, before the FullWidthSection containing the v1 showcase:

```tsx
export default function ThemeShowcaseV2( props: Record< string, unknown > ) {
	return (
		<Main fullWidthLayout isLoggedOut className="theme-showcase-v2">
			<FullWidthSection className="theme-showcase-v2__hero-section" enabled>
				<Hero />
			</FullWidthSection>
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

3. Add the hero section background style to `client/my-sites/themes/v2/style.scss`:

```scss
.theme-showcase-v2__hero-section {
	background-color: var( --studio-gray-0 );
}
```

**Step 4: Verify locally**

Visit `http://calypso.localhost:3000/themes` logged out. The hero should appear above the theme grid with headline, subtitle, and CTA. Check desktop, tablet (< 960px), and mobile (< 600px) views.

**Step 5: Lint**

```bash
yarn eslint client/my-sites/themes/v2/hero/index.tsx
yarn stylelint client/my-sites/themes/v2/hero/style.scss
yarn stylelint client/my-sites/themes/v2/style.scss
```

**Step 6: Commit**

```bash
git add client/my-sites/themes/v2/hero/ client/my-sites/themes/v2/index.tsx client/my-sites/themes/v2/style.scss
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

**Step 1: Write the failing tests**

Create `client/my-sites/themes/v2/hooks/test/use-theme-filters.test.ts`:

```typescript
/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import { setStore } from 'calypso/state/redux-store';
import { THEME_FILTERS_ADD } from 'calypso/state/themes/action-types';
import { useThemeFilters } from '../use-theme-filters';

function renderWithStore( initialState = {} ) {
	const store = createReduxStore( initialState, ( state: unknown ) => state );
	setStore( store );

	const result = renderHook( () => useThemeFilters(), {
		wrapper: ( { children } ) => (
			<ReduxProvider store={ store }>{ children }</ReduxProvider>
		),
	} );

	return { ...result, store };
}

describe( 'useThemeFilters', () => {
	test( 'returns empty object and isLoaded: false when no filters are loaded', () => {
		const { result } = renderWithStore();
		expect( result.current.subjectFilters ).toEqual( {} );
		expect( result.current.isLoaded ).toBe( false );
	} );

	test( 'returns subject filters after they are dispatched to store', () => {
		const { result, store } = renderWithStore();

		// Dispatch theme filters (same shape as the /theme-filters API response).
		store.dispatch( {
			type: THEME_FILTERS_ADD,
			filters: {
				subject: {
					blog: { name: 'Blog', description: '' },
					business: { name: 'Business', description: '' },
					portfolio: { name: 'Portfolio', description: '' },
				},
				feature: {
					'full-site-editing': { name: 'Full Site Editing', description: '' },
				},
			},
		} );

		// Re-render to pick up the new state.
		result.current; // eslint-disable-line @typescript-eslint/no-unused-expressions

		expect( result.current.isLoaded ).toBe( true );
		expect( result.current.subjectFilters ).toEqual( {
			blog: { name: 'Blog', description: '' },
			business: { name: 'Business', description: '' },
			portfolio: { name: 'Portfolio', description: '' },
		} );
	} );

	test( 'returns allFilters including non-subject filters', () => {
		const filters = {
			subject: { blog: { name: 'Blog', description: '' } },
			feature: { 'full-site-editing': { name: 'Full Site Editing', description: '' } },
		};
		const { result, store } = renderWithStore();

		store.dispatch( { type: THEME_FILTERS_ADD, filters } );

		expect( result.current.allFilters ).toEqual( filters );
	} );
} );
```

Note: The `THEME_FILTERS_ADD` action type is defined in `calypso/state/themes/action-types`. It's the same action the SSR controller dispatches in `fetchThemeFilters` (`client/my-sites/themes/controller.jsx:85-115`).

**Step 2: Run tests to verify they fail**

```bash
yarn test-client client/my-sites/themes/v2/hooks/test/use-theme-filters.test.ts
```

Expected: FAIL — `use-theme-filters` module doesn't exist.

**Step 3: Implement the hook**

Create `client/my-sites/themes/v2/hooks/use-theme-filters.ts`:

```typescript
import { useSelector } from 'react-redux';
import { getThemeFilterTerms, getThemeFilters } from 'calypso/state/themes/selectors';

/**
 * Returns theme filter data from the Redux store.
 *
 * Theme filters are fetched by the SSR controller pipeline (`fetchThemeFilters` in
 * `controller.jsx`). This hook reads from the store; it does NOT trigger fetching.
 *
 * The `/theme-filters` API returns a shape like:
 * ```
 * { subject: { blog: { name, description }, ... }, feature: { ... }, ... }
 * ```
 *
 * `subjectFilters` extracts only the `subject` taxonomy — these power the category pills.
 */
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

**Step 4: Run tests to verify they pass**

```bash
yarn test-client client/my-sites/themes/v2/hooks/test/use-theme-filters.test.ts
```

Expected: 3 tests PASS.

**Step 5: Lint and commit**

```bash
yarn eslint client/my-sites/themes/v2/hooks/use-theme-filters.ts
yarn eslint client/my-sites/themes/v2/hooks/test/use-theme-filters.test.ts
git add client/my-sites/themes/v2/hooks/use-theme-filters.ts client/my-sites/themes/v2/hooks/test/use-theme-filters.test.ts
git commit -m "feat(themes): add useThemeFilters data hook"
```

---

### Task 2.2: useThemeShowcaseUrl Hook

**Files:**
- Create: `client/my-sites/themes/v2/hooks/use-theme-showcase-url.ts`
- Create: `client/my-sites/themes/v2/hooks/test/use-theme-showcase-url.test.ts`

This is the most complex hook. It has two pure functions (easy to test) and one React hook (thin wrapper).

**Reference files:**
- `client/my-sites/themes/helpers.js` — `constructThemeShowcaseUrl()` (lines 170-196) shows how URLs are currently built.
- `client/my-sites/themes/validate-filters.js` — shows how vertical/filter segments are validated.
- `client/components/theme-tier/constants.js` — `THEME_TIERS` keys are the known tier slugs: `free`, `personal`, `premium`, `partner`, `woocommerce`, `sensei`, `community`.
- `client/state/themes/constants.js` — `STATIC_FILTERS` = `{ MYTHEMES: 'my-themes', RECOMMENDED: 'recommended', ALL: 'all' }`.

**Step 1: Write the failing tests**

Create `client/my-sites/themes/v2/hooks/test/use-theme-showcase-url.test.ts`:

```typescript
/**
 * @jest-environment jsdom
 */
import {
	parseThemeShowcaseUrl,
	buildThemeShowcaseUrl,
} from '../use-theme-showcase-url';

describe( 'parseThemeShowcaseUrl', () => {
	test( '/themes → default state', () => {
		expect( parseThemeShowcaseUrl( '/themes', '' ) ).toEqual( {
			category: 'recommended',
			tier: '',
			filter: '',
			search: '',
		} );
	} );

	test( '/themes/all → category: all', () => {
		const result = parseThemeShowcaseUrl( '/themes/all', '' );
		expect( result.category ).toBe( 'all' );
		expect( result.tier ).toBe( '' );
	} );

	test( '/themes/blog → category: blog', () => {
		const result = parseThemeShowcaseUrl( '/themes/blog', '' );
		expect( result.category ).toBe( 'blog' );
		expect( result.tier ).toBe( '' );
	} );

	test( '/themes/free → tier: free (disambiguated from category)', () => {
		const result = parseThemeShowcaseUrl( '/themes/free', '' );
		expect( result.tier ).toBe( 'free' );
		expect( result.category ).toBe( 'recommended' );
	} );

	test( '/themes/blog/free → category + tier', () => {
		const result = parseThemeShowcaseUrl( '/themes/blog/free', '' );
		expect( result.category ).toBe( 'blog' );
		expect( result.tier ).toBe( 'free' );
	} );

	test( '/themes/blog/free/filter/feature:full-site-editing → full parse', () => {
		const result = parseThemeShowcaseUrl(
			'/themes/blog/free/filter/feature:full-site-editing',
			''
		);
		expect( result.category ).toBe( 'blog' );
		expect( result.tier ).toBe( 'free' );
		expect( result.filter ).toBe( 'feature:full-site-editing' );
	} );

	test( '/themes?s=developer → search param', () => {
		const result = parseThemeShowcaseUrl( '/themes', 's=developer' );
		expect( result.search ).toBe( 'developer' );
		expect( result.category ).toBe( 'recommended' );
	} );

	test( '/themes/blog?s=developer → category + search', () => {
		const result = parseThemeShowcaseUrl( '/themes/blog', 's=developer' );
		expect( result.category ).toBe( 'blog' );
		expect( result.search ).toBe( 'developer' );
	} );

	test( 'handles localized paths like /ja/themes/blog', () => {
		const result = parseThemeShowcaseUrl( '/ja/themes/blog', '' );
		expect( result.category ).toBe( 'blog' );
	} );
} );

describe( 'buildThemeShowcaseUrl', () => {
	test( 'default state → /themes', () => {
		expect( buildThemeShowcaseUrl( { category: 'recommended', tier: '', filter: '', search: '' } ) ).toBe( '/themes' );
	} );

	test( 'category: blog, tier: free → /themes/blog/free', () => {
		expect( buildThemeShowcaseUrl( { category: 'blog', tier: 'free', filter: '', search: '' } ) ).toBe( '/themes/blog/free' );
	} );

	test( 'category: recommended omitted from URL', () => {
		expect( buildThemeShowcaseUrl( { category: 'recommended', tier: 'free', filter: '', search: '' } ) ).toBe( '/themes/free' );
	} );

	test( 'tier: free + search → /themes/free?s=developer', () => {
		expect( buildThemeShowcaseUrl( { category: 'recommended', tier: 'free', filter: '', search: 'developer' } ) ).toBe( '/themes/free?s=developer' );
	} );

	test( 'preserves non-UI filter', () => {
		expect(
			buildThemeShowcaseUrl( { category: 'blog', tier: '', filter: 'feature:full-site-editing', search: '' } )
		).toBe( '/themes/blog/filter/feature:full-site-editing' );
	} );

	test( 'category: all → /themes/all', () => {
		expect( buildThemeShowcaseUrl( { category: 'all', tier: '', filter: '', search: '' } ) ).toBe( '/themes/all' );
	} );
} );
```

**Step 2: Run tests to verify they fail**

```bash
yarn test-client client/my-sites/themes/v2/hooks/test/use-theme-showcase-url.test.ts
```

Expected: FAIL — module doesn't exist.

**Step 3: Implement**

Create `client/my-sites/themes/v2/hooks/use-theme-showcase-url.ts`:

```typescript
import page from '@automattic/calypso-router';
import { useCallback, useMemo } from 'react';
import { THEME_TIERS } from 'calypso/components/theme-tier/constants';

export interface ThemeShowcaseUrlState {
	category: string;
	tier: string;
	filter: string;
	search: string;
}

/**
 * Known tier slugs from THEME_TIERS. Used to disambiguate the first path segment
 * (e.g., `/themes/free` is a tier, not a category).
 */
const KNOWN_TIER_SLUGS = new Set( Object.keys( THEME_TIERS ) );

/**
 * Parse a theme showcase URL into its constituent filter state.
 *
 * URL structure: /themes/:category?/:tier?/filter/:filter?s=search
 * - Locale prefix (e.g., /ja/) is stripped.
 * - First segment after /themes/ is disambiguated: if it matches a known tier slug,
 *   it's the tier; otherwise, it's the category.
 */
export function parseThemeShowcaseUrl( pathname: string, search: string ): ThemeShowcaseUrlState {
	// Strip locale prefix (e.g., /ja/themes/... → /themes/...)
	const themesIndex = pathname.indexOf( '/themes' );
	const path = themesIndex >= 0 ? pathname.slice( themesIndex ) : pathname;

	// Remove /themes prefix and split into segments.
	const rest = path.replace( /^\/themes\/?/, '' );
	const segments = rest.split( '/' ).filter( Boolean );

	let category = 'recommended';
	let tier = '';
	let filter = '';

	// Parse segments.
	let i = 0;

	if ( segments.length > 0 && segments[ i ] !== 'filter' ) {
		if ( KNOWN_TIER_SLUGS.has( segments[ i ] ) ) {
			tier = segments[ i ];
		} else {
			category = segments[ i ];
		}
		i++;
	}

	if ( i < segments.length && segments[ i ] !== 'filter' ) {
		if ( KNOWN_TIER_SLUGS.has( segments[ i ] ) ) {
			tier = segments[ i ];
		}
		i++;
	}

	// Parse /filter/... segment.
	if ( i < segments.length && segments[ i ] === 'filter' ) {
		i++;
		if ( i < segments.length ) {
			filter = segments[ i ].replace( /\+/g, ' ' );
		}
	}

	// Parse search from query string.
	const params = new URLSearchParams( search );
	const searchTerm = params.get( 's' ) ?? '';

	return { category, tier, filter, search: searchTerm };
}

/**
 * Build a theme showcase URL from filter state.
 *
 * - `recommended` category is omitted (it's the default).
 * - Empty tier is omitted.
 * - Non-UI filter is preserved in `/filter/...` segment.
 * - Search is appended as `?s=...`.
 */
export function buildThemeShowcaseUrl( state: ThemeShowcaseUrlState ): string {
	const parts: string[] = [ '/themes' ];

	if ( state.category && state.category !== 'recommended' ) {
		parts.push( state.category );
	}

	if ( state.tier ) {
		parts.push( state.tier );
	}

	if ( state.filter ) {
		parts.push( 'filter', state.filter.replace( /\s/g, '+' ) );
	}

	let url = parts.join( '/' );

	if ( state.search ) {
		url += `?s=${ encodeURIComponent( state.search ) }`;
	}

	return url;
}

/**
 * React hook that reads the current theme showcase URL state and provides
 * a `navigate` function to update it.
 *
 * Usage:
 * ```
 * const { currentState, navigate } = useThemeShowcaseUrl();
 * navigate( { ...currentState, category: 'blog' } );
 * ```
 */
export function useThemeShowcaseUrl() {
	const currentState = useMemo( () => {
		if ( typeof window === 'undefined' ) {
			return { category: 'recommended', tier: '', filter: '', search: '' };
		}
		return parseThemeShowcaseUrl( window.location.pathname, window.location.search );
	}, [ typeof window !== 'undefined' ? window.location.href : '' ] );

	const navigate = useCallback( ( newState: ThemeShowcaseUrlState ) => {
		const url = buildThemeShowcaseUrl( newState );
		page( url );
	}, [] );

	return { currentState, navigate };
}
```

Note: `page` from `@automattic/calypso-router` is the client-side router used throughout Calypso. It updates the URL and triggers the controller pipeline. The `constructThemeShowcaseUrl` function in `client/my-sites/themes/helpers.js` does something similar but is coupled to the v1 component props — our version is standalone.

**Step 4: Run tests to verify they pass**

```bash
yarn test-client client/my-sites/themes/v2/hooks/test/use-theme-showcase-url.test.ts
```

Expected: All 15 tests PASS.

**Step 5: Lint and commit**

```bash
yarn eslint client/my-sites/themes/v2/hooks/use-theme-showcase-url.ts
yarn eslint client/my-sites/themes/v2/hooks/test/use-theme-showcase-url.test.ts
git add client/my-sites/themes/v2/hooks/use-theme-showcase-url.ts client/my-sites/themes/v2/hooks/test/use-theme-showcase-url.test.ts
git commit -m "feat(themes): add useThemeShowcaseUrl hook for URL-driven filter state"
```

---

### Task 2.3: v2 Filter Bar — Category Pills

**Files:**
- Create: `client/my-sites/themes/v2/filter-bar/index.tsx`
- Create: `client/my-sites/themes/v2/filter-bar/style.scss`
- Create: `client/my-sites/themes/v2/filter-bar/test/index.test.tsx`

**Step 1: Write the failing tests**

Create `client/my-sites/themes/v2/filter-bar/test/index.test.tsx`:

```tsx
/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import { setStore } from 'calypso/state/redux-store';
import { THEME_FILTERS_ADD } from 'calypso/state/themes/action-types';
import FilterBar from '../index';

// Mock the calypso-router so we can verify navigation calls.
const mockPageNavigate = jest.fn();
jest.mock( '@automattic/calypso-router', () => mockPageNavigate );

// Mock window.location for useThemeShowcaseUrl.
const mockLocation = ( pathname: string, search = '' ) => {
	Object.defineProperty( window, 'location', {
		value: { pathname, search, href: pathname + search },
		writable: true,
	} );
};

function renderWithStore( pathname = '/themes' ) {
	mockLocation( pathname );
	const store = createReduxStore( undefined, ( state: unknown ) => state );
	setStore( store );

	// Dispatch some subject filters.
	store.dispatch( {
		type: THEME_FILTERS_ADD,
		filters: {
			subject: {
				blog: { name: 'Blog', description: '' },
				business: { name: 'Business', description: '' },
			},
		},
	} );

	render(
		<ReduxProvider store={ store }>
			<FilterBar />
		</ReduxProvider>
	);
	return { store };
}

describe( 'FilterBar — Category Pills', () => {
	beforeEach( () => {
		mockPageNavigate.mockClear();
	} );

	test( 'renders "Recommended" and "All" pills', () => {
		renderWithStore();
		expect( screen.getByRole( 'button', { name: 'Recommended' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'All' } ) ).toBeVisible();
	} );

	test( 'renders subject filter pills from the store', () => {
		renderWithStore();
		expect( screen.getByRole( 'button', { name: 'Blog' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Business' } ) ).toBeVisible();
	} );

	test( 'clicking a category pill navigates to the correct URL', async () => {
		renderWithStore();
		const user = userEvent.setup();
		await user.click( screen.getByRole( 'button', { name: 'Blog' } ) );
		expect( mockPageNavigate ).toHaveBeenCalledWith( '/themes/blog' );
	} );

	test( 'active category pill has primary variant', () => {
		renderWithStore( '/themes/blog' );
		const blogButton = screen.getByRole( 'button', { name: 'Blog' } );
		// @wordpress/components Button with variant="primary" adds the is-primary class.
		expect( blogButton ).toHaveClass( 'is-primary' );
	} );
} );
```

Note: The mock for `@automattic/calypso-router` may need adjustment — the module exports a default function (`page()`). Check how it's imported in the hook. The test verifies that clicking a pill triggers navigation to the expected URL.

**Step 2: Run tests to verify they fail**

```bash
yarn test-client client/my-sites/themes/v2/filter-bar/test/index.test.tsx
```

Expected: FAIL — `FilterBar` module doesn't exist.

**Step 3: Implement the component**

Create `client/my-sites/themes/v2/filter-bar/index.tsx`:

```tsx
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useThemeFilters } from '../hooks/use-theme-filters';
import { useThemeShowcaseUrl } from '../hooks/use-theme-showcase-url';

import './style.scss';

export default function FilterBar() {
	const translate = useTranslate();
	const { subjectFilters } = useThemeFilters();
	const { currentState, navigate } = useThemeShowcaseUrl();

	const staticCategories = [
		{ slug: 'recommended', label: translate( 'Recommended' ) },
		{ slug: 'all', label: translate( 'All' ) },
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
			<div className="theme-showcase-v2-filter-bar__categories" role="tablist">
				{ categories.map( ( cat ) => (
					<Button
						key={ cat.slug }
						role="tab"
						aria-selected={ currentState.category === cat.slug }
						variant={ currentState.category === cat.slug ? 'primary' : 'secondary' }
						onClick={ () =>
							navigate( {
								...currentState,
								category: cat.slug,
							} )
						}
					>
						{ cat.label }
					</Button>
				) ) }
			</div>
		</div>
	);
}
```

Create `client/my-sites/themes/v2/filter-bar/style.scss`:

```scss
.theme-showcase-v2-filter-bar {
	max-width: 1280px;
	margin: 0 auto;
	padding: 16px 24px;
}

.theme-showcase-v2-filter-bar__categories {
	display: flex;
	gap: 8px;
	overflow-x: auto;
	-webkit-overflow-scrolling: touch;

	// Hide scrollbar on mobile but keep scrolling.
	scrollbar-width: none;

	&::-webkit-scrollbar {
		display: none;
	}
}
```

**Step 4: Run tests to verify they pass**

```bash
yarn test-client client/my-sites/themes/v2/filter-bar/test/index.test.tsx
```

Expected: 4 tests PASS.

**Step 5: Lint and commit**

```bash
yarn eslint client/my-sites/themes/v2/filter-bar/index.tsx
yarn eslint client/my-sites/themes/v2/filter-bar/test/index.test.tsx
yarn stylelint client/my-sites/themes/v2/filter-bar/style.scss
git add client/my-sites/themes/v2/filter-bar/
git commit -m "feat(themes): add category pills to v2 filter bar"
```

---

### Task 2.4: v2 Filter Bar — Plan Dropdown + Search

**Files:**
- Modify: `client/my-sites/themes/v2/filter-bar/index.tsx`
- Modify: `client/my-sites/themes/v2/filter-bar/style.scss`
- Modify: `client/my-sites/themes/v2/filter-bar/test/index.test.tsx`

**Step 1: Add tests for plan dropdown and search**

Add to `client/my-sites/themes/v2/filter-bar/test/index.test.tsx`:

```tsx
describe( 'FilterBar — Plan Dropdown', () => {
	test( 'renders a plan dropdown', () => {
		renderWithStore();
		expect( screen.getByRole( 'combobox', { name: /plan/i } ) ).toBeVisible();
	} );

	test( 'selecting a plan navigates to the correct URL', async () => {
		renderWithStore();
		const user = userEvent.setup();
		// Open the dropdown and select "Free".
		await user.selectOptions(
			screen.getByRole( 'combobox', { name: /plan/i } ),
			'free'
		);
		expect( mockPageNavigate ).toHaveBeenCalledWith( '/themes/free' );
	} );

	test( 'current tier is reflected in the dropdown', () => {
		renderWithStore( '/themes/free' );
		const dropdown = screen.getByRole( 'combobox', { name: /plan/i } );
		expect( dropdown ).toHaveValue( 'free' );
	} );
} );

describe( 'FilterBar — Search', () => {
	test( 'renders a search input', () => {
		renderWithStore();
		expect( screen.getByRole( 'searchbox' ) ).toBeVisible();
	} );

	test( 'current search term from URL is reflected in the input', () => {
		mockLocation( '/themes', '?s=developer' );
		const store = createReduxStore( undefined, ( state: unknown ) => state );
		setStore( store );
		store.dispatch( {
			type: THEME_FILTERS_ADD,
			filters: { subject: {} },
		} );
		render(
			<ReduxProvider store={ store }>
				<FilterBar />
			</ReduxProvider>
		);
		expect( screen.getByRole( 'searchbox' ) ).toHaveValue( 'developer' );
	} );
} );
```

Note: The exact test approach for search submission depends on whether you use `SearchControl`'s `onChange` with debounce or form submission. Adjust the test based on the implementation choice. The key behavior to test: typing + pressing Enter (or after debounce) triggers navigation with `?s=term`.

**Step 2: Add plan dropdown and search to the component**

Update `client/my-sites/themes/v2/filter-bar/index.tsx`:

```tsx
import { Button, SelectControl, SearchControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState, useCallback } from 'react';
import { THEME_TIERS } from 'calypso/components/theme-tier/constants';
import { useThemeFilters } from '../hooks/use-theme-filters';
import { useThemeShowcaseUrl } from '../hooks/use-theme-showcase-url';

import './style.scss';

export default function FilterBar() {
	const translate = useTranslate();
	const { subjectFilters } = useThemeFilters();
	const { currentState, navigate } = useThemeShowcaseUrl();
	const [ searchInput, setSearchInput ] = useState( currentState.search );

	const staticCategories = [
		{ slug: 'recommended', label: translate( 'Recommended' ) },
		{ slug: 'all', label: translate( 'All' ) },
	];

	const categories = [
		...staticCategories,
		...Object.entries( subjectFilters ).map( ( [ slug, filter ] ) => ( {
			slug,
			label: filter.name,
		} ) ),
	];

	// Build tier options from THEME_TIERS, filtered to isFilterable.
	const tierOptions = [
		{ label: translate( 'All Plans' ), value: '' },
		...Object.entries( THEME_TIERS )
			.filter( ( [ , config ] ) => config.isFilterable )
			.map( ( [ key, config ] ) => ( {
				label: config.label,
				value: key,
			} ) ),
	];

	const handleTierChange = useCallback(
		( tier: string ) => {
			navigate( { ...currentState, tier } );
		},
		[ currentState, navigate ]
	);

	const handleSearch = useCallback(
		( value: string ) => {
			setSearchInput( value );
		},
		[]
	);

	const handleSearchSubmit = useCallback(
		( value: string ) => {
			navigate( { ...currentState, search: value } );
		},
		[ currentState, navigate ]
	);

	return (
		<div className="theme-showcase-v2-filter-bar">
			<div className="theme-showcase-v2-filter-bar__top-row">
				<div className="theme-showcase-v2-filter-bar__categories" role="tablist">
					{ categories.map( ( cat ) => (
						<Button
							key={ cat.slug }
							role="tab"
							aria-selected={ currentState.category === cat.slug }
							variant={
								currentState.category === cat.slug ? 'primary' : 'secondary'
							}
							onClick={ () =>
								navigate( { ...currentState, category: cat.slug } )
							}
						>
							{ cat.label }
						</Button>
					) ) }
				</div>
				<div className="theme-showcase-v2-filter-bar__controls">
					<SelectControl
						className="theme-showcase-v2-filter-bar__tier-select"
						label={ translate( 'Plan' ) }
						hideLabelFromVision
						value={ currentState.tier }
						options={ tierOptions }
						onChange={ handleTierChange }
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					<SearchControl
						className="theme-showcase-v2-filter-bar__search"
						value={ searchInput }
						onChange={ handleSearch }
						onKeyDown={ ( e: React.KeyboardEvent ) => {
							if ( e.key === 'Enter' ) {
								handleSearchSubmit( searchInput );
							}
						} }
						onClose={ () => handleSearchSubmit( '' ) }
						placeholder={ translate( 'Search themes...' ) }
						__nextHasNoMarginBottom
					/>
				</div>
			</div>
		</div>
	);
}
```

**Step 3: Update styles**

Add to `client/my-sites/themes/v2/filter-bar/style.scss`:

```scss
.theme-showcase-v2-filter-bar__top-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;

	@media ( max-width: 960px ) {
		flex-direction: column;
		align-items: stretch;
	}
}

.theme-showcase-v2-filter-bar__controls {
	display: flex;
	gap: 8px;
	flex-shrink: 0;
}

.theme-showcase-v2-filter-bar__tier-select {
	min-width: 160px;
}

.theme-showcase-v2-filter-bar__search {
	min-width: 200px;

	@media ( max-width: 600px ) {
		min-width: 0;
		flex: 1;
	}
}
```

**Step 4: Run tests to verify they pass**

```bash
yarn test-client client/my-sites/themes/v2/filter-bar/test/index.test.tsx
```

Expected: All tests PASS.

**Step 5: Lint and commit**

```bash
yarn eslint client/my-sites/themes/v2/filter-bar/index.tsx
yarn stylelint client/my-sites/themes/v2/filter-bar/style.scss
git add client/my-sites/themes/v2/filter-bar/
git commit -m "feat(themes): add plan dropdown and search to v2 filter bar"
```

---

### Task 2.5: Sticky Filter Bar + Integration

**Files:**
- Modify: `client/my-sites/themes/v2/filter-bar/style.scss`
- Modify: `client/my-sites/themes/v2/index.tsx`
- Modify: `client/my-sites/themes/v2/style.scss`

**Step 1: Add sticky positioning**

Add to `client/my-sites/themes/v2/filter-bar/style.scss`:

```scss
.theme-showcase-v2-filter-bar {
	position: sticky;
	top: 0;
	z-index: 10;
	background-color: var( --color-surface );
	border-block-end: 1px solid var( --color-border-secondary );
}
```

No JavaScript scroll listeners needed.

**Step 2: Add FilterBar to ThemeShowcaseV2**

Update `client/my-sites/themes/v2/index.tsx` to include the v2 filter bar above the v1 content.

The key insight: the v1 `ThemeShowcase` component reads filter state from URL props (`category`, `tier`, `filter`, `search`) passed through by the controller's `getProps()`. When the v2 filter bar calls `page( '/themes/blog/free' )`, Calypso's router re-runs the controller pipeline, which calls `getProps()` with the new URL params, and re-renders `ThemeShowcaseV2` with updated props. The v1 `ThemeShowcase` then renders the correct themes.

So the integration is: v2 FilterBar changes the URL → controller re-runs → props update → v1 ThemeShowcase re-renders with correct data.

```tsx
import FullWidthSection from 'calypso/components/full-width-section';
import Main from 'calypso/components/main';
import { connectOptions } from '../theme-options';
import ThemeShowcase from '../theme-showcase';
import FilterBar from './filter-bar';
import Hero from './hero';

import './style.scss';

const ConnectedThemeShowcase = connectOptions( ThemeShowcase );

export default function ThemeShowcaseV2( props: Record< string, unknown > ) {
	return (
		<Main fullWidthLayout isLoggedOut className="theme-showcase-v2">
			<FullWidthSection className="theme-showcase-v2__hero-section" enabled>
				<Hero />
			</FullWidthSection>
			<FilterBar />
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

Note: At this point the page has **both** the v2 filter bar AND the v1 filter bar (which is inside `ThemeShowcase`). This is expected — both drive the same URL state so they stay in sync. In Milestone 3, when we replace the v1 grid, the v1 filter bar is removed entirely.

If you want to hide the v1 filter bar now, add CSS:

```scss
// In client/my-sites/themes/v2/style.scss
.theme-showcase-v2 .themes__controls {
	display: none;
}
```

**Step 3: Verify end-to-end**

```bash
yarn start
```

Visit `http://calypso.localhost:3000/themes` logged out. Verify:
- Click "Blog" pill → URL changes to `/themes/blog`, grid shows blog themes.
- Select "Free" in plan dropdown → URL changes to `/themes/blog/free`, grid filters.
- Type "developer" in search, press Enter → URL changes to `/themes/blog/free?s=developer`.
- Click "Recommended" pill → URL changes to `/themes/free?s=developer` (preserves tier and search).
- Sticky: scroll down, filter bar stays pinned to top.

**Step 4: Lint and commit**

```bash
yarn eslint client/my-sites/themes/v2/index.tsx
yarn stylelint client/my-sites/themes/v2/filter-bar/style.scss
yarn stylelint client/my-sites/themes/v2/style.scss
git add client/my-sites/themes/v2/
git commit -m "feat(themes): integrate v2 filter bar, replace v1 filter bar"
```

---

## Milestone 3: v2 Theme Cards + Grid

Goal: Replace the v1 theme cards and grid with the new design. The v2 filter bar (from Milestone 2) drives the data.

### Task 3.1: useThemes Data Hook

**Files:**
- Create: `client/my-sites/themes/v2/hooks/use-themes.ts`
- Create: `client/my-sites/themes/v2/hooks/test/use-themes.test.ts`

**Step 1: Write the failing tests**

Create `client/my-sites/themes/v2/hooks/test/use-themes.test.ts`:

```typescript
/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import { setStore } from 'calypso/state/redux-store';
import { receiveThemes } from 'calypso/state/themes/actions';
import { DEFAULT_THEME_QUERY } from 'calypso/state/themes/constants';
import { useThemes } from '../use-themes';

// Mock requestThemes to prevent actual API calls.
jest.mock( 'calypso/state/themes/actions', () => {
	const actual = jest.requireActual( 'calypso/state/themes/actions' );
	return {
		...actual,
		requestThemes: jest.fn( () => ( { type: 'MOCK_REQUEST_THEMES' } ) ),
	};
} );

const sampleThemes = [
	{ id: 'theme-a', name: 'Theme A', screenshot: 'https://example.com/a.png' },
	{ id: 'theme-b', name: 'Theme B', screenshot: 'https://example.com/b.png' },
];

function renderWithStore( query = DEFAULT_THEME_QUERY ) {
	const store = createReduxStore( undefined, ( state: unknown ) => state );
	setStore( store );

	const result = renderHook( () => useThemes( query ), {
		wrapper: ( { children } ) => (
			<ReduxProvider store={ store }>{ children }</ReduxProvider>
		),
	} );

	return { ...result, store };
}

describe( 'useThemes', () => {
	test( 'returns empty data initially', () => {
		const { result } = renderWithStore();
		expect( result.current.data ).toEqual( [] );
		expect( result.current.totalCount ).toBe( 0 );
	} );

	test( 'returns theme data after receiveThemes dispatch', () => {
		const query = { ...DEFAULT_THEME_QUERY };
		const { result, store } = renderWithStore( query );

		act( () => {
			store.dispatch( receiveThemes( sampleThemes, 'wpcom', query, 2 ) );
		} );

		expect( result.current.data ).toHaveLength( 2 );
		expect( result.current.totalCount ).toBe( 2 );
	} );

	test( 'dispatches requestThemes on mount', () => {
		const { requestThemes } = require( 'calypso/state/themes/actions' );
		renderWithStore();
		expect( requestThemes ).toHaveBeenCalledWith( 'wpcom', expect.any( Object ) );
	} );
} );
```

**Step 2: Run tests to verify they fail**

```bash
yarn test-client client/my-sites/themes/v2/hooks/test/use-themes.test.ts
```

Expected: FAIL — module doesn't exist.

**Step 3: Implement the hook**

Create `client/my-sites/themes/v2/hooks/use-themes.ts`:

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

/**
 * Fetches and returns a paginated list of themes for the given query.
 *
 * Dispatches `requestThemes` to the wpcom API on mount and when the query changes.
 * Returns the current data from the Redux store.
 *
 * The `stableQuery` memo prevents re-dispatching when the query object reference
 * changes but the actual values haven't.
 */
export function useThemes( query: ThemeQuery ) {
	const dispatch = useDispatch();
	const siteId = 'wpcom';

	// Stabilize the query object to prevent unnecessary re-fetches.
	// eslint-disable-next-line react-hooks/exhaustive-deps
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

Expected: 3 tests PASS.

**Step 5: Lint and commit**

```bash
yarn eslint client/my-sites/themes/v2/hooks/use-themes.ts
yarn eslint client/my-sites/themes/v2/hooks/test/use-themes.test.ts
git add client/my-sites/themes/v2/hooks/use-themes.ts client/my-sites/themes/v2/hooks/test/use-themes.test.ts
git commit -m "feat(themes): add useThemes data hook"
```

---

### Task 3.2: ThemeCardV2 Shared Component

**Files:**
- Create: `packages/components/src/theme-card-v2/index.tsx`
- Create: `packages/components/src/theme-card-v2/style.scss`
- Create: `packages/components/src/theme-card-v2/test/index.test.tsx`
- Modify: `packages/components/src/index.ts` — add export

**Step 1: Write the failing tests**

Create `packages/components/src/theme-card-v2/test/index.test.tsx`:

```tsx
/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeCardV2 from '../index';

const baseProps = {
	name: 'Flavor',
	slug: 'flavor',
	screenshotUrl: 'https://example.com/flavor.png',
};

describe( 'ThemeCardV2', () => {
	test( 'renders theme name and screenshot', () => {
		render( <ThemeCardV2 { ...baseProps } /> );
		expect( screen.getByText( 'Flavor' ) ).toBeVisible();
		expect( screen.getByAltText( 'Flavor' ) ).toHaveAttribute(
			'src',
			'https://example.com/flavor.png'
		);
	} );

	test( 'renders plan label when tierLabel is provided', () => {
		render( <ThemeCardV2 { ...baseProps } tierLabel="Premium" /> );
		expect( screen.getByText( 'Premium' ) ).toBeVisible();
	} );

	test( 'does not render plan label when tierLabel is absent', () => {
		render( <ThemeCardV2 { ...baseProps } /> );
		expect( screen.queryByText( 'Premium' ) ).not.toBeInTheDocument();
	} );

	test( 'renders "Preview" button and calls onPreview on click', async () => {
		const onPreview = jest.fn();
		render( <ThemeCardV2 { ...baseProps } onPreview={ onPreview } /> );

		const user = userEvent.setup();
		await user.click( screen.getByRole( 'button', { name: 'Preview' } ) );
		expect( onPreview ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'renders "Live Demo" link when demoUrl is provided', () => {
		render(
			<ThemeCardV2 { ...baseProps } demoUrl="https://flavordemo.wordpress.com/" />
		);
		const link = screen.getByRole( 'link', { name: 'Live Demo' } );
		expect( link ).toHaveAttribute( 'href', 'https://flavordemo.wordpress.com/' );
		expect( link ).toHaveAttribute( 'target', '_blank' );
	} );

	test( 'does not render "Live Demo" link when demoUrl is absent', () => {
		render( <ThemeCardV2 { ...baseProps } /> );
		expect( screen.queryByRole( 'link', { name: 'Live Demo' } ) ).not.toBeInTheDocument();
	} );
} );
```

**Step 2: Run tests to verify they fail**

```bash
yarn test-client packages/components/src/theme-card-v2/test/index.test.tsx
```

Expected: FAIL — module doesn't exist.

**Step 3: Implement the component**

Create `packages/components/src/theme-card-v2/index.tsx`:

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
						<Button
							variant="link"
							href={ demoUrl }
							target="_blank"
							rel="noopener noreferrer"
						>
							Live Demo
						</Button>
					) }
				</div>
			</div>
			<div className="theme-card-v2__info">
				<span className="theme-card-v2__name">{ name }</span>
				{ tierLabel && (
					<span className="theme-card-v2__tier">{ tierLabel }</span>
				) }
			</div>
		</Card>
	);
}
```

Create `packages/components/src/theme-card-v2/style.scss`:

```scss
.theme-card-v2 {
	border-radius: 8px;
	overflow: hidden;
	transition: box-shadow 0.2s ease;

	&:hover,
	&:focus-within {
		box-shadow: 0 4px 16px rgba( 0, 0, 0, 0.12 );
	}

	// Show hover actions on hover or focus-within (accessibility).
	&:hover .theme-card-v2__hover-actions,
	&:focus-within .theme-card-v2__hover-actions {
		opacity: 1;
	}
}

.theme-card-v2__thumbnail {
	position: relative;
	aspect-ratio: 16 / 10;
	overflow: hidden;
	background-color: var( --color-surface-backdrop, #f6f7f7 );
}

.theme-card-v2__screenshot {
	display: block;
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.theme-card-v2__hover-actions {
	position: absolute;
	inset: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 8px;
	background-color: rgba( 0, 0, 0, 0.5 );
	opacity: 0;
	transition: opacity 0.2s ease;
}

.theme-card-v2__info {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 16px;
}

.theme-card-v2__name {
	font-size: 0.875rem;
	font-weight: 500;
	color: var( --color-text );
}

.theme-card-v2__tier {
	font-size: 0.75rem;
	color: var( --color-text-subtle );
	padding: 2px 8px;
	background-color: var( --color-surface-backdrop, #f6f7f7 );
	border-radius: 4px;
}
```

**Step 4: Export from packages/components**

Add to `packages/components/src/index.ts` (alphabetically near other theme exports):

```typescript
export { default as ThemeCardV2 } from './theme-card-v2';
```

**Step 5: Run tests to verify they pass**

```bash
yarn test-client packages/components/src/theme-card-v2/test/index.test.tsx
```

Expected: 6 tests PASS.

**Step 6: Lint and commit**

```bash
yarn eslint packages/components/src/theme-card-v2/index.tsx
yarn eslint packages/components/src/theme-card-v2/test/index.test.tsx
yarn stylelint packages/components/src/theme-card-v2/style.scss
git add packages/components/src/theme-card-v2/ packages/components/src/index.ts
git commit -m "feat(components): add ThemeCardV2 shared component"
```

---

### Task 3.3: v2 Theme Grid with Pagination

**Files:**
- Create: `client/my-sites/themes/v2/theme-grid/index.tsx`
- Create: `client/my-sites/themes/v2/theme-grid/style.scss`
- Create: `client/my-sites/themes/v2/theme-grid/test/index.test.tsx`

**Step 1: Write the failing tests**

Create `client/my-sites/themes/v2/theme-grid/test/index.test.tsx`:

```tsx
/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import { setStore } from 'calypso/state/redux-store';
import { receiveThemes } from 'calypso/state/themes/actions';
import { DEFAULT_THEME_QUERY } from 'calypso/state/themes/constants';
import ThemeGrid from '../index';

// Mock requestThemes to prevent actual API calls.
jest.mock( 'calypso/state/themes/actions', () => {
	const actual = jest.requireActual( 'calypso/state/themes/actions' );
	return {
		...actual,
		requestThemes: jest.fn( () => ( { type: 'MOCK_REQUEST_THEMES' } ) ),
	};
} );

// Mock IntersectionObserver.
window.IntersectionObserver = jest.fn( () => ( {
	observe: jest.fn(),
	disconnect: jest.fn(),
	unobserve: jest.fn(),
	root: null,
	rootMargin: '',
	thresholds: [],
	takeRecords: jest.fn(),
} ) );

const sampleThemes = [
	{ id: 'theme-a', name: 'Theme A', screenshot: 'https://example.com/a.png', demo_uri: '' },
	{ id: 'theme-b', name: 'Theme B', screenshot: 'https://example.com/b.png', demo_uri: '' },
	{ id: 'theme-c', name: 'Theme C', screenshot: 'https://example.com/c.png', demo_uri: '' },
];

function renderWithThemes( themes = sampleThemes, totalCount = themes.length ) {
	const query = { ...DEFAULT_THEME_QUERY };
	const store = createReduxStore( undefined, ( state: unknown ) => state );
	setStore( store );

	store.dispatch( receiveThemes( themes, 'wpcom', query, totalCount ) );

	render(
		<ReduxProvider store={ store }>
			<ThemeGrid query={ query } />
		</ReduxProvider>
	);

	return { store };
}

describe( 'ThemeGrid', () => {
	test( 'renders correct number of theme cards', () => {
		renderWithThemes();
		expect( screen.getAllByRole( 'button', { name: 'Preview' } ) ).toHaveLength( 3 );
	} );

	test( 'renders theme names', () => {
		renderWithThemes();
		expect( screen.getByText( 'Theme A' ) ).toBeVisible();
		expect( screen.getByText( 'Theme B' ) ).toBeVisible();
		expect( screen.getByText( 'Theme C' ) ).toBeVisible();
	} );

	test( 'renders sentinel when more pages are available', () => {
		// 50 total but only 3 loaded → more pages available.
		renderWithThemes( sampleThemes, 50 );
		expect( document.querySelector( '.theme-showcase-v2-grid__sentinel' ) ).toBeInTheDocument();
	} );

	test( 'does not render sentinel when on last page', () => {
		// 3 total and 3 loaded → last page.
		renderWithThemes( sampleThemes, 3 );
		expect(
			document.querySelector( '.theme-showcase-v2-grid__sentinel' )
		).not.toBeInTheDocument();
	} );
} );
```

**Step 2: Run tests to verify they fail**

```bash
yarn test-client client/my-sites/themes/v2/theme-grid/test/index.test.tsx
```

Expected: FAIL — module doesn't exist.

**Step 3: Implement the component**

Create `client/my-sites/themes/v2/theme-grid/index.tsx`:

```tsx
import { Spinner } from '@wordpress/components';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ThemeCardV2 } from '@automattic/components';
import { DEFAULT_THEME_QUERY } from 'calypso/state/themes/constants';
import { useThemes, type ThemeQuery } from '../hooks/use-themes';

import './style.scss';

interface ThemeGridProps {
	query: ThemeQuery;
}

export default function ThemeGrid( { query }: ThemeGridProps ) {
	const [ page, setPage ] = useState( 1 );
	const fullQuery = { ...query, page, number: DEFAULT_THEME_QUERY.number };
	const { data: themes, isLoading, totalCount } = useThemes( fullQuery );
	const sentinelRef = useRef< HTMLDivElement >( null );

	const hasMore = themes.length < totalCount;

	// Reset page when query changes (new category, tier, search).
	useEffect( () => {
		setPage( 1 );
	}, [ query.search, query.tier, query.filter, query.collection ] );

	// IntersectionObserver for infinite scroll.
	const handleIntersect = useCallback(
		( entries: IntersectionObserverEntry[] ) => {
			if ( entries[ 0 ].isIntersecting && hasMore && ! isLoading ) {
				setPage( ( prev ) => prev + 1 );
			}
		},
		[ hasMore, isLoading ]
	);

	useEffect( () => {
		const sentinel = sentinelRef.current;
		if ( ! sentinel ) {
			return;
		}

		const observer = new IntersectionObserver( handleIntersect, {
			rootMargin: '200px',
		} );
		observer.observe( sentinel );

		return () => observer.disconnect();
	}, [ handleIntersect ] );

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
						// Navigate to theme detail page.
						window.location.href = `/theme/${ theme.id }`;
					} }
				/>
			) ) }
			{ isLoading && (
				<div className="theme-showcase-v2-grid__loading">
					<Spinner />
				</div>
			) }
			{ hasMore && (
				<div ref={ sentinelRef } className="theme-showcase-v2-grid__sentinel" />
			) }
		</div>
	);
}
```

Note: The `theme` objects from `getThemesForQuery` have this shape: `{ id, name, screenshot, demo_uri, price, author, ... }`. The `id` is the theme slug (e.g., `'flavor'`). The `price` field is present for paid themes (e.g., `'$69'`) and absent for free themes.

Create `client/my-sites/themes/v2/theme-grid/style.scss`:

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

.theme-showcase-v2-grid__loading {
	grid-column: 1 / -1;
	display: flex;
	justify-content: center;
	padding: 24px;
}

.theme-showcase-v2-grid__sentinel {
	grid-column: 1 / -1;
	height: 1px;
}
```

**Step 4: Run tests to verify they pass**

```bash
yarn test-client client/my-sites/themes/v2/theme-grid/test/index.test.tsx
```

Expected: 4 tests PASS.

**Step 5: Lint and commit**

```bash
yarn eslint client/my-sites/themes/v2/theme-grid/index.tsx
yarn eslint client/my-sites/themes/v2/theme-grid/test/index.test.tsx
yarn stylelint client/my-sites/themes/v2/theme-grid/style.scss
git add client/my-sites/themes/v2/theme-grid/
git commit -m "feat(themes): add v2 theme grid with infinite scroll pagination"
```

---

### Task 3.4: Replace v1 Grid with v2 Grid

**Files:**
- Modify: `client/my-sites/themes/v2/index.tsx`
- Modify: `client/my-sites/themes/v2/style.scss`

**Step 1: Rewrite ThemeShowcaseV2 to use v2 components**

Replace the entire content of `client/my-sites/themes/v2/index.tsx`. This removes the v1 `ConnectedThemeShowcase` wrapper and wires everything to v2 hooks + components.

```tsx
import FullWidthSection from 'calypso/components/full-width-section';
import Main from 'calypso/components/main';
import { DEFAULT_THEME_QUERY } from 'calypso/state/themes/constants';
import FilterBar from './filter-bar';
import Hero from './hero';
import { useThemeShowcaseUrl } from './hooks/use-theme-showcase-url';
import ThemeGrid from './theme-grid';

import './style.scss';

/**
 * v2 Theme Showcase — fully replaces v1 components.
 *
 * The `props` arg is still passed by the controller's `getProps()` for backwards
 * compatibility (analytics, etc.), but filter state is now read from the URL
 * via `useThemeShowcaseUrl()`.
 */
export default function ThemeShowcaseV2( props: Record< string, unknown > ) {
	const { currentState } = useThemeShowcaseUrl();

	// Build the theme query from current URL state.
	// The API uses `collection: 'recommended'` for the curated default view.
	// When a specific subject category is selected (e.g., 'blog'), the API uses
	// `filter: 'subject:blog'` instead.
	const query = {
		...DEFAULT_THEME_QUERY,
		search: currentState.search || '',
		tier: currentState.tier || '',
		filter: currentState.filter || '',
		...( currentState.category === 'recommended'
			? { collection: 'recommended' }
			: currentState.category !== 'all'
				? { filter: [ currentState.filter, `subject:${ currentState.category }` ].filter( Boolean ).join( '+' ) }
				: {} ),
	};

	return (
		<Main fullWidthLayout isLoggedOut className="theme-showcase-v2">
			<FullWidthSection className="theme-showcase-v2__hero-section" enabled>
				<Hero />
			</FullWidthSection>
			<FilterBar />
			<FullWidthSection className="theme-showcase-v2__grid-section" enabled>
				<ThemeGrid query={ query } />
			</FullWidthSection>
		</Main>
	);
}
```

Key logic for the query:
- **`/themes` (recommended)**: `{ collection: 'recommended' }` — returns curated themes.
- **`/themes/all`**: No `collection` or `filter` — returns all themes.
- **`/themes/blog`**: `{ filter: 'subject:blog' }` — filters by subject.
- **`/themes/free`**: `{ tier: 'free' }` — filters by tier.
- **`/themes/blog/free`**: `{ filter: 'subject:blog', tier: 'free' }` — both.
- **`/themes?s=developer`**: `{ search: 'developer', collection: 'recommended' }`.

Reference: `client/my-sites/themes/theme-showcase.jsx` lines 611-637 shows how the v1 component builds `themeProps` from the same kind of state. The `tabFilter` prop maps to our `collection` field. The `filter` prop maps to our `filter` field.

**Step 2: Update styles — remove v1 overrides**

In `client/my-sites/themes/v2/style.scss`, remove the `.theme-showcase-v2 .themes__controls { display: none; }` hack from Task 2.5 if it was added. The v1 `ThemeShowcase` component is no longer rendered.

```scss
.theme-showcase-v2 {
	&.main.is-logged-out {
		max-width: none;
		padding: 0;
	}
}

.theme-showcase-v2__hero-section {
	background-color: var( --studio-gray-0 );
}

.theme-showcase-v2__grid-section {
	max-width: 1280px;
	margin: 0 auto;
	padding: 0 24px;
}
```

**Step 3: Verify end-to-end**

```bash
yarn start
```

Visit `http://calypso.localhost:3000/themes` logged out. Verify:
- Default view shows recommended themes in a 3-column grid.
- Click "Blog" pill → URL changes to `/themes/blog`, grid shows blog themes.
- Select "Free" in plan dropdown → URL becomes `/themes/blog/free`, grid filters.
- Type "developer" in search, press Enter → grid shows search results.
- Scroll down → more themes load (infinite scroll).
- Click a theme card "Preview" → navigates to `/theme/:slug`.
- Resize window → 3 columns → 2 columns → 1 column.

**Step 4: Lint and commit**

```bash
yarn eslint client/my-sites/themes/v2/index.tsx
yarn stylelint client/my-sites/themes/v2/style.scss
git add client/my-sites/themes/v2/index.tsx client/my-sites/themes/v2/style.scss
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

Create `client/my-sites/themes/v2/banners/ai-builder-banner.tsx`:

Reference the design post at `https://wpbranddesign.wordpress.com/2025/09/25/themes-lp/` (section "4. Banners"). This replaces the old "Design your own" Assembler banner. CTA links to the AI website builder flow.

```tsx
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

export default function AiBuilderBanner() {
	const translate = useTranslate();

	return (
		<div className="theme-showcase-v2-banner theme-showcase-v2-banner--ai-builder">
			<div className="theme-showcase-v2-banner__content">
				<h2 className="theme-showcase-v2-banner__title">
					{ translate( 'Build your site with AI' ) }
				</h2>
				<p className="theme-showcase-v2-banner__description">
					{ translate(
						'Describe your vision and let AI create a custom website for you in minutes. No coding required.'
					) }
				</p>
				<Button
					className="theme-showcase-v2-banner__cta"
					variant="primary"
					href="/start/ai"
				>
					{ translate( 'Try AI builder' ) }
				</Button>
			</div>
			<div className="theme-showcase-v2-banner__illustration">
				{ /* Replace with final illustration from design */ }
			</div>
		</div>
	);
}
```

Note: The CTA href `/start/ai` is a placeholder — confirm the correct AI builder flow URL. Check the existing Assembler banner in the v1 codebase for the current URL.

Create `client/my-sites/themes/v2/banners/style.scss`:

```scss
.theme-showcase-v2-banner {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 32px;
	padding: 48px;
	border-radius: 8px;
	margin: 24px 0;

	@media ( max-width: 960px ) {
		flex-direction: column;
		text-align: center;
		padding: 32px 24px;
	}
}

.theme-showcase-v2-banner--ai-builder {
	background-color: var( --studio-blueberry-0, #f0f2ff );
}

.theme-showcase-v2-banner--difm {
	background-color: var( --studio-green-0, #f0faf0 );
}

.theme-showcase-v2-banner--plan {
	background-color: var( --studio-gray-0 );
	border: 1px solid var( --color-border-secondary );
}

.theme-showcase-v2-banner__content {
	flex: 1;
	max-width: 480px;

	@media ( max-width: 960px ) {
		max-width: none;
	}
}

.theme-showcase-v2-banner__title {
	font-size: 1.5rem;
	font-weight: 500;
	margin: 0 0 12px;
}

.theme-showcase-v2-banner__description {
	font-size: 1rem;
	line-height: 1.5;
	color: var( --color-text-subtle );
	margin: 0 0 20px;
}

.theme-showcase-v2-banner__illustration {
	flex-shrink: 0;
	max-width: 300px;

	img {
		width: 100%;
		height: auto;
	}
}
```

**Step 2: Lint and commit**

```bash
yarn eslint client/my-sites/themes/v2/banners/ai-builder-banner.tsx
yarn stylelint client/my-sites/themes/v2/banners/style.scss
git add client/my-sites/themes/v2/banners/
git commit -m "feat(themes): add AI builder banner to v2 showcase"
```

---

### Task 4.2: DIFM Banner

**Files:**
- Create: `client/my-sites/themes/v2/banners/difm-banner.tsx`

**Step 1: Implement the banner**

Create `client/my-sites/themes/v2/banners/difm-banner.tsx`:

```tsx
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

export default function DifmBanner() {
	const translate = useTranslate();

	return (
		<div className="theme-showcase-v2-banner theme-showcase-v2-banner--difm">
			<div className="theme-showcase-v2-banner__content">
				<h2 className="theme-showcase-v2-banner__title">
					{ translate( 'Let us build your site' ) }
				</h2>
				<p className="theme-showcase-v2-banner__description">
					{ translate(
						'Our professional designers will create a custom website tailored to your brand. Fast, affordable, hassle-free.'
					) }
				</p>
				<Button
					className="theme-showcase-v2-banner__cta"
					variant="primary"
					href="/website-design-service/"
				>
					{ translate( 'Get started' ) }
				</Button>
			</div>
			<div className="theme-showcase-v2-banner__illustration">
				{ /* Replace with final illustration from design */ }
			</div>
		</div>
	);
}
```

Note: The CTA href `/website-design-service/` points to the DIFM landing page. Confirm the correct URL — search the codebase for existing DIFM links.

**Step 2: Lint and commit**

```bash
yarn eslint client/my-sites/themes/v2/banners/difm-banner.tsx
git add client/my-sites/themes/v2/banners/difm-banner.tsx
git commit -m "feat(themes): add DIFM banner to v2 showcase"
```

---

### Task 4.3: Contextual Plan Banners + Partner Themes Section

**Files:**
- Create: `client/my-sites/themes/v2/banners/plan-banner.tsx`
- Create: `client/my-sites/themes/v2/partner-themes/index.tsx`
- Create: `client/my-sites/themes/v2/partner-themes/style.scss`

**Step 1: Implement plan banner**

Create `client/my-sites/themes/v2/banners/plan-banner.tsx`:

```tsx
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { THEME_TIERS } from 'calypso/components/theme-tier/constants';

interface PlanBannerProps {
	tier: string;
}

const TIER_COPY: Record< string, { heading: string; description: string; cta: string } > = {};
// This will be populated with translate() calls — see Step 2.

export default function PlanBanner( { tier }: PlanBannerProps ) {
	const translate = useTranslate();

	const tierConfig = THEME_TIERS[ tier ];
	if ( ! tierConfig ) {
		return null;
	}

	// Tier-specific copy. Adjust strings based on the design post and content team.
	const copy = {
		free: {
			heading: translate( 'Free themes for every type of site' ),
			description: translate(
				'All free themes include powerful customization options. Just pick one and start building.'
			),
		},
		premium: {
			heading: translate( 'Premium themes, included with your plan' ),
			description: translate(
				'Unlock premium themes with advanced layouts and exclusive features, included with the Personal plan and above.'
			),
		},
		partner: {
			heading: translate( 'Partner themes built by expert designers' ),
			description: translate(
				'Premium themes created by our design partners. Try risk-free for 14 days.'
			),
		},
	}[ tier ] ?? {
		heading: translate( 'Explore %s themes', { args: [ tierConfig.label ] } ),
		description: '',
	};

	return (
		<div className="theme-showcase-v2-banner theme-showcase-v2-banner--plan">
			<div className="theme-showcase-v2-banner__content">
				<h2 className="theme-showcase-v2-banner__title">{ copy.heading }</h2>
				{ copy.description && (
					<p className="theme-showcase-v2-banner__description">{ copy.description }</p>
				) }
				<Button variant="secondary" href="/pricing">
					{ translate( 'View plans' ) }
				</Button>
			</div>
		</div>
	);
}
```

**Step 2: Implement partner themes section**

Create `client/my-sites/themes/v2/partner-themes/index.tsx`:

```tsx
import { useTranslate } from 'i18n-calypso';
import { ThemeCardV2 } from '@automattic/components';
import { useThemes } from '../hooks/use-themes';
import PlanBanner from '../banners/plan-banner';

import './style.scss';

export default function PartnerThemesSection() {
	const translate = useTranslate();
	const { data: themes, isLoading } = useThemes( {
		tier: 'partner',
		number: 6,
	} );

	if ( isLoading || themes.length === 0 ) {
		return null;
	}

	return (
		<div className="theme-showcase-v2-partner-themes">
			<h2 className="theme-showcase-v2-partner-themes__heading">
				{ translate( 'Partner themes' ) }
			</h2>
			<PlanBanner tier="partner" />
			<div className="theme-showcase-v2-partner-themes__grid">
				{ themes.map( ( theme ) => (
					<ThemeCardV2
						key={ theme.id }
						name={ theme.name }
						slug={ theme.id }
						screenshotUrl={ theme.screenshot }
						demoUrl={ theme.demo_uri }
						tierLabel={ theme.price || undefined }
						onPreview={ () => {
							window.location.href = `/theme/${ theme.id }`;
						} }
					/>
				) ) }
			</div>
		</div>
	);
}
```

Create `client/my-sites/themes/v2/partner-themes/style.scss`:

```scss
.theme-showcase-v2-partner-themes {
	margin: 48px 0;
}

.theme-showcase-v2-partner-themes__heading {
	font-size: 1.5rem;
	font-weight: 500;
	margin: 0 0 16px;
}

.theme-showcase-v2-partner-themes__grid {
	display: grid;
	grid-template-columns: repeat( 3, 1fr );
	gap: 24px;
	margin-block-start: 24px;

	@media ( max-width: 960px ) {
		grid-template-columns: repeat( 2, 1fr );
	}

	@media ( max-width: 600px ) {
		grid-template-columns: 1fr;
	}
}
```

**Step 3: Lint and commit**

```bash
yarn eslint client/my-sites/themes/v2/banners/plan-banner.tsx
yarn eslint client/my-sites/themes/v2/partner-themes/index.tsx
yarn stylelint client/my-sites/themes/v2/partner-themes/style.scss
git add client/my-sites/themes/v2/banners/plan-banner.tsx client/my-sites/themes/v2/partner-themes/
git commit -m "feat(themes): add plan banners and partner themes section"
```

---

### Task 4.4: Banner Interleaving

**Files:**
- Modify: `client/my-sites/themes/v2/index.tsx`

**Step 1: Wire banners into the page layout**

Update `client/my-sites/themes/v2/index.tsx` to interleave banners between sections.

The page layout from top to bottom:
1. Hero (hidden during search)
2. FilterBar (sticky)
3. ThemeGrid (first batch — ~2 rows = 6 themes)
4. AI Builder Banner (hidden during search)
5. ThemeGrid (remaining themes, infinite scroll)
6. DIFM Banner (hidden during search)
7. Partner Themes Section (hidden during search; shown when no tier filter or tier=partner)
8. FAQs (Task 4.6)

To interleave banners into the grid, modify `ThemeGrid` to accept a `bannerAfterRow` prop, or keep it simple: render banners as siblings between grid sections in the parent.

Simpler approach — split the grid at defined breakpoints in the parent:

```tsx
import AiBuilderBanner from './banners/ai-builder-banner';
import DifmBanner from './banners/difm-banner';
import PlanBanner from './banners/plan-banner';
import PartnerThemesSection from './partner-themes';

export default function ThemeShowcaseV2( props: Record< string, unknown > ) {
	const { currentState } = useThemeShowcaseUrl();
	const isSearchActive = Boolean( currentState.search );
	const hasTierFilter = Boolean( currentState.tier );
	const query = { /* ... same as Task 3.4 ... */ };

	return (
		<Main fullWidthLayout isLoggedOut className="theme-showcase-v2">
			{ ! isSearchActive && (
				<FullWidthSection className="theme-showcase-v2__hero-section" enabled>
					<Hero />
				</FullWidthSection>
			) }
			<FilterBar />
			<FullWidthSection className="theme-showcase-v2__grid-section" enabled>
				<ThemeGrid query={ query } />
				{ ! isSearchActive && <AiBuilderBanner /> }
				{ ! isSearchActive && hasTierFilter && <PlanBanner tier={ currentState.tier } /> }
				{ ! isSearchActive && <DifmBanner /> }
				{ ! isSearchActive && <PartnerThemesSection /> }
			</FullWidthSection>
		</Main>
	);
}
```

Note: This places banners after the grid. To interleave them *within* the grid (after row N), the `ThemeGrid` component would need to accept `children` or `insertions` to render between card rows. That's a more complex approach — start with the simpler "after the grid" layout and iterate based on design feedback.

**Step 2: Verify locally and commit**

```bash
yarn start
```

Verify:
- Default view: Hero → FilterBar → Themes → AI Banner → DIFM Banner → Partner Themes.
- Search active: Hero hidden, banners hidden, only grid + filter bar visible.
- Tier filter active: Plan banner visible with tier-specific copy.

```bash
yarn eslint client/my-sites/themes/v2/index.tsx
git add client/my-sites/themes/v2/index.tsx
git commit -m "feat(themes): interleave banners into v2 showcase layout"
```

---

### Task 4.5: Search Results View + Empty State

**Files:**
- Modify: `client/my-sites/themes/v2/theme-grid/index.tsx`
- Create: `client/my-sites/themes/v2/empty-state/index.tsx`
- Create: `client/my-sites/themes/v2/empty-state/style.scss`
- Create: `client/my-sites/themes/v2/empty-state/test/index.test.tsx`

Note: The search-active hero collapse and banner hiding were already handled in Task 4.4 (the `isSearchActive` conditional in the parent). This task adds the empty state component.

**Step 1: Write the failing tests**

Create `client/my-sites/themes/v2/empty-state/test/index.test.tsx`:

```tsx
/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import EmptyState from '../index';

describe( 'EmptyState', () => {
	test( 'renders three CTA cards', () => {
		render( <EmptyState /> );
		expect( screen.getByText( /build with ai/i ) ).toBeVisible();
		expect( screen.getByText( /hire an expert/i ) ).toBeVisible();
		expect( screen.getByText( /upload a theme/i ) ).toBeVisible();
	} );

	test( 'AI card links to AI builder flow', () => {
		render( <EmptyState /> );
		const aiLink = screen.getByRole( 'link', { name: /build with ai/i } );
		expect( aiLink ).toHaveAttribute( 'href', expect.stringContaining( '/start' ) );
	} );

	test( 'Expert card links to DIFM page', () => {
		render( <EmptyState /> );
		const expertLink = screen.getByRole( 'link', { name: /hire an expert/i } );
		expect( expertLink ).toHaveAttribute( 'href', expect.stringContaining( '/website-design-service' ) );
	} );

	test( 'Upload card links to theme upload', () => {
		render( <EmptyState /> );
		const uploadLink = screen.getByRole( 'link', { name: /upload a theme/i } );
		expect( uploadLink ).toHaveAttribute( 'href', '/themes/upload' );
	} );
} );
```

**Step 2: Implement the empty state**

Create `client/my-sites/themes/v2/empty-state/index.tsx`:

```tsx
import { Card, Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { Icon, brush, people, upload as uploadIcon } from '@wordpress/icons';

import './style.scss';

export default function EmptyState() {
	const translate = useTranslate();

	const cards = [
		{
			icon: brush,
			title: translate( 'Build with AI' ),
			description: translate( 'Describe your vision and get a custom site in minutes.' ),
			href: '/start/ai',
		},
		{
			icon: people,
			title: translate( 'Hire an expert' ),
			description: translate( 'Let our professional designers build your site for you.' ),
			href: '/website-design-service/',
		},
		{
			icon: uploadIcon,
			title: translate( 'Upload a theme' ),
			description: translate( 'Already have a theme? Upload and activate it.' ),
			href: '/themes/upload',
		},
	];

	return (
		<div className="theme-showcase-v2-empty-state">
			<h2 className="theme-showcase-v2-empty-state__heading">
				{ translate( 'No themes match your search' ) }
			</h2>
			<p className="theme-showcase-v2-empty-state__subheading">
				{ translate( "Try a different search, or explore other ways to get started:" ) }
			</p>
			<div className="theme-showcase-v2-empty-state__cards">
				{ cards.map( ( card ) => (
					<Card key={ card.href } className="theme-showcase-v2-empty-state__card">
						<Icon icon={ card.icon } size={ 32 } />
						<h3>{ card.title }</h3>
						<p>{ card.description }</p>
						<Button variant="secondary" href={ card.href }>
							{ card.title }
						</Button>
					</Card>
				) ) }
			</div>
		</div>
	);
}
```

Create `client/my-sites/themes/v2/empty-state/style.scss`:

```scss
.theme-showcase-v2-empty-state {
	text-align: center;
	padding: 48px 24px;
}

.theme-showcase-v2-empty-state__heading {
	font-size: 1.5rem;
	font-weight: 500;
	margin: 0 0 8px;
}

.theme-showcase-v2-empty-state__subheading {
	color: var( --color-text-subtle );
	margin: 0 0 32px;
}

.theme-showcase-v2-empty-state__cards {
	display: grid;
	grid-template-columns: repeat( 3, 1fr );
	gap: 24px;
	max-width: 960px;
	margin: 0 auto;

	@media ( max-width: 960px ) {
		grid-template-columns: repeat( 2, 1fr );
	}

	@media ( max-width: 600px ) {
		grid-template-columns: 1fr;
	}
}

.theme-showcase-v2-empty-state__card {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12px;
	padding: 32px 24px;
	text-align: center;

	h3 {
		font-size: 1.125rem;
		font-weight: 500;
		margin: 0;
	}

	p {
		color: var( --color-text-subtle );
		margin: 0;
	}
}
```

**Step 3: Wire empty state into ThemeGrid**

Modify `client/my-sites/themes/v2/theme-grid/index.tsx` to show the empty state when there are no results and loading is complete:

```tsx
import EmptyState from '../empty-state';

// Inside the ThemeGrid component, before the return:
if ( ! isLoading && themes.length === 0 ) {
	return <EmptyState />;
}
```

**Step 4: Run tests**

```bash
yarn test-client client/my-sites/themes/v2/empty-state/test/index.test.tsx
```

Expected: 4 tests PASS.

**Step 5: Lint and commit**

```bash
yarn eslint client/my-sites/themes/v2/empty-state/index.tsx
yarn eslint client/my-sites/themes/v2/empty-state/test/index.test.tsx
yarn eslint client/my-sites/themes/v2/theme-grid/index.tsx
yarn stylelint client/my-sites/themes/v2/empty-state/style.scss
git add client/my-sites/themes/v2/empty-state/ client/my-sites/themes/v2/theme-grid/index.tsx
git commit -m "feat(themes): add empty state with CTA cards"
```

---

### Task 4.6: FAQ Accordion

**Files:**
- Create: `client/my-sites/themes/v2/faqs/index.tsx`
- Create: `client/my-sites/themes/v2/faqs/style.scss`
- Modify: `client/my-sites/themes/v2/index.tsx`

**Step 1: Implement the FAQ component**

Create `client/my-sites/themes/v2/faqs/index.tsx`:

Use native `<details>`/`<summary>` elements for simplicity and built-in accessibility. FAQ content is placeholder — to be finalized by the content team.

```tsx
import { useTranslate } from 'i18n-calypso';

import './style.scss';

interface FaqItem {
	question: string;
	answer: string;
}

export default function Faqs() {
	const translate = useTranslate();

	// FAQ content — placeholder strings. Replace with final copy from content team.
	const faqs: FaqItem[] = [
		{
			question: translate( 'Are WordPress.com themes free?' ),
			answer: translate(
				'Many themes are completely free. Premium themes are included with paid plans, and partner themes are available for a one-time purchase.'
			),
		},
		{
			question: translate( 'Can I change my theme later?' ),
			answer: translate(
				'Yes, you can switch themes at any time. Your content stays the same — only the design changes.'
			),
		},
		{
			question: translate( 'Can I customize a theme?' ),
			answer: translate(
				'Absolutely. Every theme can be customized using the WordPress editor. Change colors, fonts, layouts, and more without writing code.'
			),
		},
		{
			question: translate( 'What is a partner theme?' ),
			answer: translate(
				'Partner themes are premium designs created by expert design agencies. They come with a 14-day risk-free trial and dedicated support from the theme partner.'
			),
		},
		{
			question: translate( 'Do I need a paid plan to use a theme?' ),
			answer: translate(
				'Free themes work on any plan, including the free plan. Premium themes require a paid plan. Partner themes can be purchased separately.'
			),
		},
	];

	return (
		<div className="theme-showcase-v2-faqs">
			<h2 className="theme-showcase-v2-faqs__heading">
				{ translate( 'Frequently asked questions' ) }
			</h2>
			<div className="theme-showcase-v2-faqs__list">
				{ faqs.map( ( faq, index ) => (
					<details key={ index } className="theme-showcase-v2-faqs__item">
						<summary className="theme-showcase-v2-faqs__question">
							{ faq.question }
						</summary>
						<p className="theme-showcase-v2-faqs__answer">{ faq.answer }</p>
					</details>
				) ) }
			</div>
		</div>
	);
}
```

Create `client/my-sites/themes/v2/faqs/style.scss`:

```scss
.theme-showcase-v2-faqs {
	max-width: 800px;
	margin: 48px auto;
	padding: 0 24px;
}

.theme-showcase-v2-faqs__heading {
	font-size: 1.5rem;
	font-weight: 500;
	margin: 0 0 24px;
	text-align: center;
}

.theme-showcase-v2-faqs__item {
	border-block-end: 1px solid var( --color-border-secondary );
	padding: 16px 0;

	&[open] .theme-showcase-v2-faqs__question::after {
		transform: rotate( 180deg );
	}
}

.theme-showcase-v2-faqs__question {
	font-size: 1rem;
	font-weight: 500;
	cursor: pointer;
	list-style: none;
	display: flex;
	justify-content: space-between;
	align-items: center;

	&::after {
		content: "▾";
		transition: transform 0.2s ease;
		flex-shrink: 0;
		margin-inline-start: 16px;
	}

	// Remove default marker.
	&::-webkit-details-marker {
		display: none;
	}
}

.theme-showcase-v2-faqs__answer {
	margin: 12px 0 0;
	color: var( --color-text-subtle );
	line-height: 1.6;
}
```

**Step 2: Wire into ThemeShowcaseV2**

Add `<Faqs />` at the bottom of `ThemeShowcaseV2`, after the banners and partner themes, inside a `FullWidthSection`:

```tsx
import Faqs from './faqs';

// At the bottom of the Main component, before closing </Main>:
{ ! isSearchActive && (
	<FullWidthSection className="theme-showcase-v2__faqs-section" enabled>
		<Faqs />
	</FullWidthSection>
) }
```

**Step 3: Lint and commit**

```bash
yarn eslint client/my-sites/themes/v2/faqs/index.tsx
yarn stylelint client/my-sites/themes/v2/faqs/style.scss
yarn eslint client/my-sites/themes/v2/index.tsx
git add client/my-sites/themes/v2/faqs/ client/my-sites/themes/v2/index.tsx
git commit -m "feat(themes): add FAQ accordion section to v2 showcase"
```

---

### Task 4.7: SEO Content Refresh

**Files:**
- Create: `client/my-sites/themes/v2/hooks/use-theme-showcase-seo.ts`
- Modify: `client/my-sites/themes/v2/index.tsx`

**Reference:** The v1 SEO hook is at `client/my-sites/themes/use-theme-showcase-logged-out-seo-content.js`. It returns `{ title, header, description }` based on a matrix of `filter × tier`. The v2 version uses the same structure but with refreshed copy and reads from our `useThemeShowcaseUrl` state instead of props.

**Step 1: Implement the SEO hook**

Create `client/my-sites/themes/v2/hooks/use-theme-showcase-seo.ts`:

```typescript
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useThemeShowcaseUrl } from './use-theme-showcase-url';

interface SeoContent {
	title: string;
	description: string;
}

/**
 * Returns SEO metadata (title, description) based on the current URL state.
 *
 * This is the v2 equivalent of `use-theme-showcase-logged-out-seo-content.js`.
 * The copy has been refreshed but the structure is the same: category × tier matrix.
 */
export function useThemeShowcaseSeo(): SeoContent {
	const translate = useTranslate();
	const { currentState } = useThemeShowcaseUrl();

	return useMemo( () => {
		const { category, tier, search } = currentState;

		// Search active — generic title.
		if ( search ) {
			return {
				title: translate( 'Search WordPress Themes: "%(search)s"', { args: { search } } ),
				description: translate(
					'Search results for "%(search)s" across free and premium WordPress themes on WordPress.com.',
					{ args: { search } }
				),
			};
		}

		// Tier-specific suffix.
		const tierLabel: Record< string, string > = {
			free: translate( 'Free' ),
			premium: translate( 'Premium' ),
			partner: translate( 'Partner' ),
		};
		const tierSuffix = tier && tierLabel[ tier ] ? ` — ${ tierLabel[ tier ] }` : '';

		// Category-specific titles.
		const categoryTitles: Record< string, string > = {
			recommended: translate( 'WordPress Themes' ),
			all: translate( 'All WordPress Themes' ),
			blog: translate( 'Blog WordPress Themes' ),
			business: translate( 'Business WordPress Themes' ),
			portfolio: translate( 'Portfolio WordPress Themes' ),
			store: translate( 'Store WordPress Themes' ),
		};

		const title = ( categoryTitles[ category ] ?? translate( 'WordPress Themes' ) ) + tierSuffix;

		const description = translate(
			'Starter themes to build a beautiful website. Choose from hundreds of free and premium designs, then customize every detail.'
		);

		return { title, description };
	}, [ translate, currentState ] );
}
```

**Step 2: Wire into ThemeShowcaseV2**

Add to `client/my-sites/themes/v2/index.tsx`:

```tsx
import DocumentHead from 'calypso/components/data/document-head';
import { useThemeShowcaseSeo } from './hooks/use-theme-showcase-seo';

// Inside ThemeShowcaseV2, before the return:
const seo = useThemeShowcaseSeo();

// As the first child of <Main>:
<DocumentHead title={ seo.title } meta={ [ { name: 'description', content: seo.description } ] } />
```

Reference: `DocumentHead` is the standard Calypso component for setting `<title>` and `<meta>` tags. It's used throughout the codebase. Search for `import DocumentHead` for examples.

**Step 3: Lint and commit**

```bash
yarn eslint client/my-sites/themes/v2/hooks/use-theme-showcase-seo.ts
yarn eslint client/my-sites/themes/v2/index.tsx
git add client/my-sites/themes/v2/hooks/use-theme-showcase-seo.ts client/my-sites/themes/v2/index.tsx
git commit -m "feat(themes): refresh SEO content for v2 showcase"
```

---

### Task 4.8: Responsive Polish + Accessibility Audit

**Files:**
- Modify: various `style.scss` and `.tsx` files across `client/my-sites/themes/v2/`
- Modify: `packages/components/src/theme-card-v2/style.scss`

**Step 1: Audit responsive behavior at each breakpoint**

Open DevTools responsive mode and test at these widths:
- **1280px+ (desktop)**: 3-column grid, hero with side-by-side text + illustration, full filter bar.
- **960px (tablet landscape)**: 3→2 column grid transition, hero stacks vertically.
- **768px (tablet portrait)**: 2-column grid, filter pills start scrolling horizontally.
- **600px (mobile large)**: 2→1 column grid transition.
- **375px (mobile)**: 1-column grid, all text sizes comfortable, no horizontal overflow.

Fix issues like:
- Text overflowing containers at small widths.
- Filter bar categories overflowing (should scroll, not wrap).
- Banner illustrations being too large on mobile.
- Padding/margins too large on mobile (reduce from 48px to 24px).

**Step 2: Accessibility audit**

Test with keyboard only (no mouse):

1. **Tab through the page**: Tab should visit: search input → tier dropdown → each category pill → each theme card → each banner CTA → each FAQ item → footer links. No focus should get trapped.

2. **Theme cards**: The hover overlay CTAs (`Preview`, `Live Demo`) must also appear on `:focus-within`. Verify this is already handled by the CSS rule in `theme-card-v2/style.scss`:
   ```scss
   &:focus-within .theme-card-v2__hover-actions { opacity: 1; }
   ```

3. **Filter pills**: Add `aria-label` to the category pill container. The pills already use `role="tab"` and `aria-selected` from Task 2.3. Verify arrow key navigation works (this may need a custom `onKeyDown` handler to move focus between pills — add if missing).

4. **Search input**: Verify `SearchControl` has an accessible label. The `placeholder` prop provides a visible label. Add `aria-label` if needed:
   ```tsx
   <SearchControl aria-label={ translate( 'Search themes' ) } ... />
   ```

5. **Sticky filter bar**: Verify that when the filter bar becomes sticky, tabbing forward moves to the grid content below it (not back to the hero).

6. **FAQ accordion**: Native `<details>`/`<summary>` elements are accessible by default. Verify screen reader announces expanded/collapsed state.

7. **Color contrast**: Check Blueberry accent (#3858e9 or similar) against white background. WCAG AA requires 4.5:1 for normal text, 3:1 for large text. Use browser DevTools color contrast checker.

8. **Screen reader**: Use VoiceOver (macOS) to navigate the page. Verify:
   - Page title is announced.
   - Filter changes are announced (consider adding a live region for "Showing X themes").
   - Theme names are announced when navigating the grid.

**Step 3: Fix all issues found**

Common fixes:
- Add `aria-label` props to containers missing them.
- Add keyboard event handlers for arrow key navigation on pills.
- Add `role="list"` to grid container if using `<div>` instead of `<ul>`.
- Add `aria-live="polite"` region to announce theme count changes.
- Fix any color contrast issues by adjusting the accent shade.

**Step 4: Lint and commit**

```bash
yarn eslint client/my-sites/themes/v2/**/*.tsx
yarn stylelint client/my-sites/themes/v2/**/*.scss
yarn stylelint packages/components/src/theme-card-v2/style.scss
git add client/my-sites/themes/v2/ packages/components/src/theme-card-v2/
git commit -m "fix(themes): polish responsive layout and accessibility in v2 showcase"
```

---

### Task 4.9: E2E Tests

**Files:**
- Create: `test/e2e/specs/appearance/theme-showcase-v2.spec.ts`

**Important:** Follow the **new Playwright Test framework** (`.spec.ts` files, NOT the legacy Jest runner). Reference:
- Style guide: `test/e2e/docs-new/new_style_guide.md`
- Custom fixtures: `test/e2e/docs-new/custom_fixtures.md`
- Example: `test/e2e/specs/appearance/theme__details-preview.spec.ts`

Always use `--reporter=list` when running tests to prevent the HTML report from hanging.

**Step 1: Write Playwright E2E tests**

Create `test/e2e/specs/appearance/theme-showcase-v2.spec.ts`:

```typescript
import { expect, tags, test } from '../../lib/pw-base';

test.describe( 'Theme Showcase v2 — Logged Out', {
	tag: [ tags.CALYPSO_PR ],
}, () => {
	test( 'Page loads with default Recommended themes', async ( { pageIncognito } ) => {
		await test.step( 'When I visit the themes page logged out', async function () {
			await pageIncognito.goto( '/themes' );
		} );

		await test.step( 'Then I see the hero section', async function () {
			await expect(
				pageIncognito.locator( '.theme-showcase-v2-hero__title' )
			).toBeVisible();
		} );

		await test.step( 'And I see theme cards in the grid', async function () {
			await expect(
				pageIncognito.locator( '.theme-card-v2' ).first()
			).toBeVisible();
		} );

		await test.step( 'And the Recommended pill is active', async function () {
			await expect(
				pageIncognito.locator( '[role="tab"][aria-selected="true"]' )
			).toHaveText( 'Recommended' );
		} );
	} );

	test( 'Clicking a category pill filters themes', async ( { pageIncognito } ) => {
		await test.step( 'Given I am on the themes page', async function () {
			await pageIncognito.goto( '/themes' );
			await pageIncognito.waitForSelector( '.theme-card-v2' );
		} );

		await test.step( 'When I click the Blog category pill', async function () {
			await pageIncognito.locator( '[role="tab"]', { hasText: 'Blog' } ).click();
		} );

		await test.step( 'Then the URL updates to /themes/blog', async function () {
			await expect( pageIncognito ).toHaveURL( /\/themes\/blog/ );
		} );

		await test.step( 'And the Blog pill is now active', async function () {
			await expect(
				pageIncognito.locator( '[role="tab"][aria-selected="true"]' )
			).toHaveText( 'Blog' );
		} );
	} );

	test( 'Selecting a plan tier filters themes', async ( { pageIncognito } ) => {
		await test.step( 'Given I am on the themes page', async function () {
			await pageIncognito.goto( '/themes' );
			await pageIncognito.waitForSelector( '.theme-card-v2' );
		} );

		await test.step( 'When I select Free from the plan dropdown', async function () {
			await pageIncognito.locator( '.theme-showcase-v2-filter-bar__tier-select select' ).selectOption( 'free' );
		} );

		await test.step( 'Then the URL includes /free', async function () {
			await expect( pageIncognito ).toHaveURL( /\/themes\/free/ );
		} );
	} );

	test( 'Searching shows matching results', async ( { pageIncognito } ) => {
		await test.step( 'Given I am on the themes page', async function () {
			await pageIncognito.goto( '/themes' );
			await pageIncognito.waitForSelector( '.theme-card-v2' );
		} );

		await test.step( 'When I search for a theme', async function () {
			await pageIncognito.locator( '.theme-showcase-v2-filter-bar__search input' ).fill( 'developer' );
			await pageIncognito.keyboard.press( 'Enter' );
		} );

		await test.step( 'Then the URL includes the search param', async function () {
			await expect( pageIncognito ).toHaveURL( /[?&]s=developer/ );
		} );
	} );

	test( 'Clicking a theme card navigates to theme detail', async ( { pageIncognito } ) => {
		await test.step( 'Given I am on the themes page', async function () {
			await pageIncognito.goto( '/themes' );
			await pageIncognito.waitForSelector( '.theme-card-v2' );
		} );

		await test.step( 'When I click Preview on the first theme', async function () {
			await pageIncognito.locator( '.theme-card-v2' ).first().hover();
			await pageIncognito.locator( '.theme-card-v2__hover-actions button', { hasText: 'Preview' } ).first().click();
		} );

		await test.step( 'Then I navigate to the theme detail page', async function () {
			await expect( pageIncognito ).toHaveURL( /\/theme\// );
		} );
	} );
} );
```

Note: The exact selectors may need adjusting based on the final DOM structure. The test uses `pageIncognito` fixture for unauthenticated (logged-out) access. If that fixture isn't available, use `page` with a fresh browser context.

**Step 2: Run tests**

```bash
cd test/e2e && yarn playwright test specs/appearance/theme-showcase-v2.spec.ts --reporter=list
```

Expected: All tests PASS.

Note: E2E tests run against a deployed environment (calypso.localhost or staging). The feature flag must be enabled in the target environment for the tests to pass. When running locally, ensure `config/development.json` has `"themes/showcase-v2": true`.

**Step 3: Commit**

```bash
git add test/e2e/specs/appearance/theme-showcase-v2.spec.ts
git commit -m "test(themes): add E2E Playwright tests for v2 showcase"
```

---

## Nice-to-have: MSD Support

### Task MSD.1: Extend to MSD Users

**Files:**
- Modify: `client/my-sites/themes/v2/hooks/use-is-theme-showcase-v2-enabled.ts`
- Modify: `client/my-sites/themes/v2/hooks/test/use-is-theme-showcase-v2-enabled.test.ts`
- Modify: `client/my-sites/themes/controller-logged-in.jsx` — add v2 branch in `renderThemes()`
- Modify: `client/my-sites/themes/v2/hero/index.tsx` — add `isLoggedIn` prop

**Step 1: Add new test cases for MSD**

Add to `client/my-sites/themes/v2/hooks/test/use-is-theme-showcase-v2-enabled.test.ts`:

```typescript
test( 'returns true when user is logged in with dashboard opt-in and no site selected', () => {
	( config.isEnabled as jest.Mock ).mockReturnValue( true );
	const { result } = renderWithStore( {
		currentUser: { id: 123, user: { ID: 123 } },
		ui: { selectedSiteId: null },
		// The dashboard opt-in state shape — check hasDashboardOptIn selector.
	} );
	expect( result.current ).toBe( true );
} );

test( 'returns false when user is logged in without dashboard opt-in', () => {
	( config.isEnabled as jest.Mock ).mockReturnValue( true );
	const { result } = renderWithStore( {
		currentUser: { id: 123, user: { ID: 123 } },
		ui: { selectedSiteId: null },
		// No dashboard opt-in in state.
	} );
	expect( result.current ).toBe( false );
} );
```

Note: Check `client/state/dashboard/selectors.ts` for the exact state shape `hasDashboardOptIn` reads from. The import is `import { hasDashboardOptIn } from 'calypso/state/dashboard/selectors'` — same as `use-is-marketplace-redesign-enabled.ts`.

**Step 2: Update the hook**

```typescript
import { isEnabled } from '@automattic/calypso-config';
import { useSelector } from 'react-redux';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { hasDashboardOptIn } from 'calypso/state/dashboard/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

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

**Step 3: Update the logged-in controller**

Read `client/my-sites/themes/controller-logged-in.jsx` and find the `renderThemes()` function. Add the v2 branch for MSD users (logged-in, no site selected, dashboard opt-in). Follow the exact same pattern as the logged-out controller from Task 1.3:

```jsx
import { isEnabled } from '@automattic/calypso-config';
import ThemeShowcaseV2 from './v2';

// In renderThemes(), before the default v1 rendering:
if ( isEnabled( 'themes/showcase-v2' ) && ! context.params.site_id ) {
	// MSD context — logged in but no site selected.
	const props = getProps( context );
	context.primary = <ThemeShowcaseV2 { ...props } />;
	return next();
}
```

Note: The exact gating logic depends on the controller's existing structure. The key check is: feature flag on + no site selected. The `hasDashboardOptIn` check is in the hook, not in the controller — the controller just renders `ThemeShowcaseV2`, and the hook inside it will handle the rest.

**Step 4: Adapt hero copy for MSD context**

Add an `isLoggedIn` prop to the Hero component:

```tsx
// client/my-sites/themes/v2/hero/index.tsx
interface HeroProps {
	isLoggedIn?: boolean;
}

export default function Hero( { isLoggedIn = false }: HeroProps ) {
	const translate = useTranslate();

	const ctaText = isLoggedIn
		? translate( 'Create a site' )
		: translate( 'Get started' );
	const ctaHref = isLoggedIn ? '/start' : '/start';

	// ... rest of component with { ctaText } and { ctaHref }
```

Pass `isLoggedIn` from `ThemeShowcaseV2`:

```tsx
import { useSelector } from 'react-redux';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

// Inside ThemeShowcaseV2:
const isLoggedIn = useSelector( isUserLoggedIn );

// Pass to Hero:
<Hero isLoggedIn={ isLoggedIn } />
```

**Step 5: Test with masterbar navigation**

The logged-in layout shows the masterbar. Verify that the v2 showcase renders correctly below it and that the sticky filter bar accounts for the masterbar height. If the filter bar hides behind the masterbar, adjust `top` in the sticky CSS:

```scss
.theme-showcase-v2-filter-bar {
	// var( --masterbar-height ) is set by Calypso's layout.
	top: var( --masterbar-height, 0 );
}
```

**Step 6: Run tests, lint, commit**

```bash
yarn test-client client/my-sites/themes/v2/hooks/test/use-is-theme-showcase-v2-enabled.test.ts
yarn eslint client/my-sites/themes/v2/hooks/use-is-theme-showcase-v2-enabled.ts
yarn eslint client/my-sites/themes/controller-logged-in.jsx
yarn eslint client/my-sites/themes/v2/hero/index.tsx
git add client/my-sites/themes/v2/ client/my-sites/themes/controller-logged-in.jsx
git commit -m "feat(themes): extend v2 showcase to MSD users"
```
