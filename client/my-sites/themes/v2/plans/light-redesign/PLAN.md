# Themes Landing Page Light Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Modernize the logged-out Themes LP with visual changes (hero, filter bar, card styling, banners) without rebuilding the data layer, gated behind a feature flag.

**Architecture:** In-place modifications to existing files in `client/my-sites/themes/`. A `themes/showcase-modern` feature flag gates all visual changes for logged-out users only. New presentational components (hero, filter bar, banners) are conditionally rendered inside existing parent components. Theme cards get an `is-modern` CSS class for visual tweaks — no new card component.

**Strategy:** 3 milestones (~5-8 days total). Each milestone is independently shippable.

**Tech Stack:** React + TypeScript, Redux (existing hooks/selectors), `@wordpress/components`, `@wordpress/base-styles`, `@wordpress/icons`, SCSS, `FullWidthSection` from Plugins LP.

**Design doc:** `client/my-sites/themes/v2/plans/light-redesign/DESIGN.md`

---

## Milestone 1: Foundation + Hero (~1-2 days)

Goal: Feature flag + new hero section. Everything else stays unchanged.

### Task 1.1: Feature Flag

**Depends on:** nothing

**Files:**
- Modify: `config/development.json`
- Modify: `config/test.json`
- Modify: `config/production.json`
- Modify: `config/stage.json`
- Modify: `config/horizon.json`
- Modify: `config/wpcalypso.json`

**Step 1: Add the feature flag to all config files**

In each file, find the `"features"` object and add `"themes/showcase-modern"`. Place it alphabetically near the existing `"marketplace-redesign"` key.

Set to `true` in `development.json` and `test.json` only. Set to `false` in all other files (4 files). Skip `config/dashboard-*.json` — this is a Calypso feature, not a Dashboard feature.

Example (in `config/development.json`, inside `"features"`, near line 129):

```json
"themes/showcase-modern": true,
```

Example (in `config/production.json`, inside `"features"`):

```json
"themes/showcase-modern": false,
```

**Step 2: Verify**

```bash
grep -r "themes/showcase-modern" config/
```

Expected: 6 files, 2 with `true`, 4 with `false`.

**Step 3: Commit**

```bash
git add config/
git commit -m "feat(themes): add themes/showcase-modern feature flag"
```

---

### Task 1.2: useIsThemeShowcaseModernEnabled Hook

**Depends on:** Task 1.1

**Files:**
- Create: `client/my-sites/themes/hooks/use-is-theme-showcase-modern-enabled.ts`
- Create: `client/my-sites/themes/hooks/test/use-is-theme-showcase-modern-enabled.test.tsx`

**Step 1: Write the failing tests**

Create `client/my-sites/themes/hooks/test/use-is-theme-showcase-modern-enabled.test.tsx`:

```tsx
/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { renderHook } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import { setStore } from 'calypso/state/redux-store';
import { useIsThemeShowcaseModernEnabled } from '../use-is-theme-showcase-modern-enabled';

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
			...storeState,
		},
		( state: unknown ) => state
	);
	setStore( store );

	return renderHook( () => useIsThemeShowcaseModernEnabled(), {
		wrapper: ( { children } ) => (
			<ReduxProvider store={ store }>{ children }</ReduxProvider>
		),
	} );
}

describe( 'useIsThemeShowcaseModernEnabled', () => {
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
} );
```

**Step 2: Run tests to verify they fail**

```bash
yarn test-client client/my-sites/themes/hooks/test/use-is-theme-showcase-modern-enabled.test.tsx
```

Expected: FAIL — module not found.

**Step 3: Write the implementation**

Create `client/my-sites/themes/hooks/use-is-theme-showcase-modern-enabled.ts`:

```ts
import { isEnabled } from '@automattic/calypso-config';
import { useSelector } from 'react-redux';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

export function useIsThemeShowcaseModernEnabled(): boolean {
	const isLoggedIn = useSelector( isUserLoggedIn );
	return isEnabled( 'themes/showcase-modern' ) && ! isLoggedIn;
}
```

**Step 4: Run tests to verify they pass**

```bash
yarn test-client client/my-sites/themes/hooks/test/use-is-theme-showcase-modern-enabled.test.tsx
```

Expected: 3 tests PASS.

⚠️ **VERIFY:** If the logged-in test fails, check the exact state shape `isUserLoggedIn` expects by reading `client/state/current-user/selectors.ts`. Adjust the `currentUser` shape in the test to match.

**Step 5: Lint and commit**

```bash
yarn eslint --fix client/my-sites/themes/hooks/use-is-theme-showcase-modern-enabled.ts
yarn eslint --fix client/my-sites/themes/hooks/test/use-is-theme-showcase-modern-enabled.test.tsx
git add client/my-sites/themes/hooks/
git commit -m "feat(themes): add useIsThemeShowcaseModernEnabled hook"
```

---

### Task 1.3: Hero Modern Component

**Depends on:** Task 1.2

**Files:**
- Create: `client/my-sites/themes/hero-modern/index.tsx`
- Create: `client/my-sites/themes/hero-modern/style.scss`
- Create: `client/my-sites/themes/hero-modern/test/index.test.tsx`

**Context:** The current logged-out hero is in `theme-showcase-header.jsx:122-128` — a `div.themes__header-logged-out` with `h1` + `p.page-sub-header`. The new hero wraps content in `FullWidthSection` (see `client/components/full-width-section/index.jsx` — takes `enabled`, `className`, `children` props).

Follow the Plugins LP banner visual patterns:
- `TelexBanner` at `client/my-sites/plugins/plugins-banners/telex-banner/` — text + illustration layout, serif title, 16px radius
- `BusinessPlanBanner` at `client/my-sites/plugins/plugins-banners/business-plan-banner/` — dark background variant

**Step 1: Write the failing test**

Create `client/my-sites/themes/hero-modern/test/index.test.tsx`:

```tsx
/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import HeroModern from '../index';

describe( 'HeroModern', () => {
	const defaultProps = {
		title: 'Find the perfect theme',
		description: 'Browse hundreds of beautiful themes for your WordPress site.',
	};

	test( 'renders title and description', () => {
		render( <HeroModern { ...defaultProps } /> );
		expect( screen.getByText( defaultProps.title ) ).toBeVisible();
		expect( screen.getByText( defaultProps.description ) ).toBeVisible();
	} );

	test( 'renders AI builder CTA', () => {
		render( <HeroModern { ...defaultProps } /> );
		expect( screen.getByRole( 'link', { name: /build with ai/i } ) ).toBeVisible();
	} );

	test( 'renders inside a full-width section', () => {
		const { container } = render( <HeroModern { ...defaultProps } /> );
		expect( container.querySelector( '.full-width-section' ) ).toBeInTheDocument();
	} );

	test( 'collapses when isSearching is true', () => {
		const { container } = render( <HeroModern { ...defaultProps } isSearching /> );
		expect( container.querySelector( '.hero-modern--collapsed' ) ).toBeInTheDocument();
	} );
} );
```

**Step 2: Run tests to verify they fail**

```bash
yarn test-client client/my-sites/themes/hero-modern/test/index.test.tsx
```

Expected: FAIL — module not found.

**Step 3: Write the component**

Create `client/my-sites/themes/hero-modern/index.tsx`:

```tsx
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import FullWidthSection from 'calypso/components/full-width-section';
import { preventWidows } from 'calypso/lib/formatting';

import './style.scss';

interface HeroModernProps {
	title: string;
	description: string;
	isSearching?: boolean;
}

const HeroModern = ( { title, description, isSearching = false }: HeroModernProps ) => {

	return (
		<FullWidthSection
			enabled
			className={ clsx( 'hero-modern', { 'hero-modern--collapsed': isSearching } ) }
		>
			<div className="hero-modern__content">
				<h1 className="hero-modern__title">{ preventWidows( title ) }</h1>
				{ ! isSearching && (
					<>
						<p className="hero-modern__description">{ preventWidows( description ) }</p>
						<Button
							className="hero-modern__cta"
							variant="primary"
							href="/start/ai"
						>
							{ __( 'Build with AI' ) }
						</Button>
					</>
				) }
			</div>
			{ ! isSearching && (
				<div className="hero-modern__illustration" aria-hidden="true" />
			) }
		</FullWidthSection>
	);
};

export default HeroModern;
```

⚠️ **VERIFY:** Check the AI builder flow URL. Look at the existing `TelexBanner` (`client/my-sites/plugins/plugins-banners/telex-banner/index.jsx:20`) for how it constructs the CTA URL. For themes, the AI builder entry point may be `/start/ai` or similar — check by searching for AI builder references: `grep -r "ai.*builder\|start/ai\|website-builder" client/my-sites/themes/ client/landing/stepper/`.

**Step 4: Write the styles**

Create `client/my-sites/themes/hero-modern/style.scss`:

```scss
@import "@automattic/typography/styles/variables";
@import "@wordpress/base-styles/breakpoints";

.hero-modern {
	.full-width-section__content {
		display: flex;
		flex-direction: column;
		padding: 48px 24px;
		gap: 24px;

		@media ( min-width: $break-small ) {
			flex-direction: row;
			align-items: center;
			padding: 64px 40px;
		}
	}
}

.hero-modern--collapsed {
	.full-width-section__content {
		padding: 32px 24px;

		@media ( min-width: $break-small ) {
			padding: 32px 40px;
		}
	}
}

.hero-modern__content {
	flex: 1;
}

.hero-modern__title {
	font-family: $brand-serif;
	font-size: rem( 40px );
	font-weight: 400;
	line-height: 1.1;
	margin: 0 0 16px;
	color: var( --studio-blue-50 );

	@media ( min-width: $break-small ) {
		font-size: rem( 50px );
	}
}

.hero-modern__description {
	font-size: $font-body-large;
	line-height: 1.5;
	margin-bottom: 24px;
	color: var( --studio-gray-90 );
	max-width: 500px;
}

.components-button.hero-modern__cta {
	width: fit-content;
	font-size: $font-body;
	border-radius: 4px;
	font-weight: 500;
	padding: 12px 24px;
	height: auto;
}

.hero-modern__illustration {
	display: none;

	@media ( min-width: $break-small ) {
		display: block;
		flex: 0 0 40%;
		min-height: 240px;
		border-radius: 16px;
		background: var( --studio-blue-5 );
	}
}
```

⚠️ **NOTE:** The illustration is a placeholder (blue background). The actual illustration asset will come from the design team. For now this gives the correct layout structure. Update the `.hero-modern__illustration` background when the asset is available.

**Step 5: Run tests to verify they pass**

```bash
yarn test-client client/my-sites/themes/hero-modern/test/index.test.tsx
```

Expected: 4 tests PASS.

**Step 6: Lint and format**

```bash
yarn eslint --fix client/my-sites/themes/hero-modern/index.tsx
yarn eslint --fix client/my-sites/themes/hero-modern/test/index.test.tsx
yarn stylelint client/my-sites/themes/hero-modern/style.scss
yarn prettier --write client/my-sites/themes/hero-modern/
```

**Step 7: Commit**

```bash
git add client/my-sites/themes/hero-modern/
git commit -m "feat(themes): add HeroModern component for themes showcase"
```

---

### Task 1.4: Integrate Hero into ThemeShowcaseHeader

**Depends on:** Task 1.3

**Files:**
- Modify: `client/my-sites/themes/theme-showcase-header.jsx:1-131`

**Context:** The logged-out header is rendered at lines 122-128:

```jsx
<div className="themes__header-logged-out">
	<div className="themes__page-heading">
		<h1>{ preventWidows( themesHeaderTitle ) }</h1>
		<p className="page-sub-header">{ preventWidows( themesHeaderDescription ) }</p>
	</div>
</div>
```

We conditionally render `HeroModern` instead when the flag is on.

**Step 1: Add the imports**

At the top of `theme-showcase-header.jsx`, add:

```jsx
import HeroModern from './hero-modern';
import { useIsThemeShowcaseModernEnabled } from './hooks/use-is-theme-showcase-modern-enabled';
```

**Step 2: Add the hook call**

Inside the `ThemeShowcaseHeader` function, after the existing `useSelector` calls (around line 38), add:

```jsx
const isModern = useIsThemeShowcaseModernEnabled();
```

**Step 3: Update the `search` prop**

The `ThemeShowcaseHeader` component needs to know if a search is active so it can pass `isSearching` to the hero. Add `search` to the component's props:

```jsx
export default function ThemeShowcaseHeader( {
	canonicalUrl,
	filter,
	tier,
	vertical,
	search,                         // <-- add this
	isCollectionView = false,
	noIndex = false,
	isSiteECommerceFreeTrial = false,
} ) {
```

⚠️ **VERIFY:** Check that the parent (`theme-showcase.jsx:656-664`) passes a `search` prop to `ThemeShowcaseHeader`. Currently it does not — you may need to add `search={ search }` to the `<ThemeShowcaseHeader>` JSX in `theme-showcase.jsx` render method (around line 656). The `search` variable is already available in the render scope (line 588).

**Step 4: Replace the logged-out header block**

Replace lines 122-128 (the logged-out `else` branch) with:

```jsx
) : isModern ? (
	<HeroModern
		title={ themesHeaderTitle }
		description={ themesHeaderDescription }
		isSearching={ !! search }
	/>
) : (
	<div className="themes__header-logged-out">
		<div className="themes__page-heading">
			<h1>{ preventWidows( themesHeaderTitle ) }</h1>
			<p className="page-sub-header">{ preventWidows( themesHeaderDescription ) }</p>
		</div>
	</div>
) }
```

**Step 5: Run existing tests to verify no regressions**

```bash
yarn test-client client/my-sites/themes/test/logged-out.jsx
```

Expected: All existing tests PASS.

**Step 6: Lint and commit**

```bash
yarn eslint --fix client/my-sites/themes/theme-showcase-header.jsx
git add client/my-sites/themes/theme-showcase-header.jsx
git commit -m "feat(themes): integrate HeroModern into ThemeShowcaseHeader"
```

---

## Milestone 2: Filter Bar + Theme Cards (~2-3 days)

Goal: Replace the logged-out filter bar and apply card visual updates.

### Task 2.1: FilterBarModern Component

**Depends on:** Milestone 1 complete

**Files:**
- Create: `client/my-sites/themes/filter-bar-modern/index.tsx`
- Create: `client/my-sites/themes/filter-bar-modern/style.scss`
- Create: `client/my-sites/themes/filter-bar-modern/test/index.test.tsx`

**Context:** The current filter UI is two blocks in `theme-showcase.jsx` render():
- `div.themes__controls` (lines 688-721): `SearchThemes` + `CustomSelectWrapper`
- `div.themes__filters` (lines 722-738): `ThemesToolbarGroup`

The new `FilterBarModern` combines all three (pills, dropdown, search) in one component. It receives the same data and callbacks as props — no data fetching of its own.

Reference the existing components for prop shapes:
- `ThemesToolbarGroup` (`client/my-sites/themes/themes-toolbar-group/index.tsx`): takes `items: { key, text }[]`, `selectedKey`, `onSelect`
- `CustomSelectWrapper` (`client/my-sites/themes/custom-select-wrapper.tsx`): wraps `@wordpress/components` `CustomSelectControl`
- `SearchThemes` (`client/components/search-themes/`): takes `query`, `onSearch`

**Step 1: Write the failing tests**

Create `client/my-sites/themes/filter-bar-modern/test/index.test.tsx`:

```tsx
/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterBarModern from '../index';

describe( 'FilterBarModern', () => {
	const defaultProps = {
		categories: [
			{ key: 'recommended', text: 'Recommended' },
			{ key: 'all', text: 'All' },
			{ key: 'blog', text: 'Blog' },
		],
		selectedCategory: 'recommended',
		onCategorySelect: jest.fn(),
		tiers: [
			{ key: 'all', name: 'All' },
			{ key: 'free', name: 'Free' },
			{ key: 'premium', name: 'Premium' },
		],
		selectedTier: 'all',
		onTierSelect: jest.fn(),
		searchQuery: '',
		onSearch: jest.fn(),
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'renders category pills', () => {
		render( <FilterBarModern { ...defaultProps } /> );
		expect( screen.getByRole( 'button', { name: 'Recommended' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'All' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Blog' } ) ).toBeVisible();
	} );

	test( 'highlights the selected category', () => {
		render( <FilterBarModern { ...defaultProps } /> );
		const recommended = screen.getByRole( 'button', { name: 'Recommended' } );
		expect( recommended ).toHaveClass( 'is-active' );
	} );

	test( 'calls onCategorySelect when a pill is clicked', async () => {
		const user = userEvent.setup();
		render( <FilterBarModern { ...defaultProps } /> );
		await user.click( screen.getByRole( 'button', { name: 'Blog' } ) );
		expect( defaultProps.onCategorySelect ).toHaveBeenCalledWith(
			expect.objectContaining( { key: 'blog' } )
		);
	} );

	test( 'renders search input', () => {
		render( <FilterBarModern { ...defaultProps } /> );
		expect( screen.getByPlaceholderText( /search themes/i ) ).toBeVisible();
	} );
} );
```

**Step 2: Run tests to verify they fail**

```bash
yarn test-client client/my-sites/themes/filter-bar-modern/test/index.test.tsx
```

Expected: FAIL — module not found.

**Step 3: Write the component**

Create `client/my-sites/themes/filter-bar-modern/index.tsx`:

```tsx
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { search as searchIcon } from '@wordpress/icons';
import clsx from 'clsx';
import { useCallback } from 'react';
import { SearchThemes } from 'calypso/components/search-themes';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

import './style.scss';

interface Category {
	key: string;
	text: string;
}

interface Tier {
	key: string;
	name: string;
}

interface FilterBarModernProps {
	categories: Category[];
	selectedCategory: string;
	onCategorySelect: ( category: Category ) => void;
	tiers: Tier[];
	selectedTier: string;
	onTierSelect: ( attrs: { selectedItem: Tier } ) => void;
	searchQuery: string;
	onSearch: ( query: string ) => void;
	showTierFilter?: boolean;
}

const FilterBarModern = ( {
	categories,
	selectedCategory,
	onCategorySelect,
	tiers,
	selectedTier,
	onTierSelect,
	searchQuery,
	onSearch,
	showTierFilter = true,
}: FilterBarModernProps ) => {
	const handleRecordTracksEvent = useCallback( ( eventName: string ) => {
		recordTracksEvent( eventName );
	}, [] );

	return (
		<div className="filter-bar-modern">
			<div className="filter-bar-modern__categories">
				{ categories.map( ( category ) => (
					<Button
						key={ category.key }
						className={ clsx( 'filter-bar-modern__pill', {
							'is-active': category.key === selectedCategory,
						} ) }
						onClick={ () => onCategorySelect( category ) }
					>
						{ category.text }
					</Button>
				) ) }
			</div>
			<div className="filter-bar-modern__controls">
				{ showTierFilter && (
					<select
						className="filter-bar-modern__tier-select"
						value={ selectedTier }
						onChange={ ( event ) => {
							const tier = tiers.find( ( t ) => t.key === event.target.value );
							if ( tier ) {
								onTierSelect( { selectedItem: tier } );
							}
						} }
						aria-label={ __( 'Filter by plan' ) }
					>
						{ tiers.map( ( tier ) => (
							<option key={ tier.key } value={ tier.key }>
								{ tier.name }
							</option>
						) ) }
					</select>
				) }
				<SearchThemes
					query={ searchQuery }
					onSearch={ onSearch }
					recordTracksEvent={ handleRecordTracksEvent }
				/>
			</div>
		</div>
	);
};

export default FilterBarModern;
```

⚠️ **NOTE:** Reuses `SearchThemes` from `client/components/search-themes/` — it's SSR-proven (renders in the logged-out showcase today), provides clear button with tracks event, enter-to-search behavior, and consistent `SearchControl` styling. Restyle via CSS overrides on `.search-themes-card` within `.filter-bar-modern` if needed.

⚠️ **VERIFY:** The `onTierSelect` callback shape matches the existing `this.onTierSelectFilter` in `theme-showcase.jsx:341-365` — it expects `{ selectedItem: { key } }`. Confirm this by reading line 342.

**Step 4: Write the styles**

Create `client/my-sites/themes/filter-bar-modern/style.scss`:

```scss
@import "@automattic/typography/styles/variables";
@import "@wordpress/base-styles/breakpoints";

.filter-bar-modern {
	display: flex;
	flex-direction: column;
	gap: 16px;
	padding: 16px 24px;
	position: sticky;
	top: 0;
	z-index: 10;
	background: var( --studio-white );
	border-block-end: 1px solid var( --color-neutral-5 );

	@media ( min-width: $break-small ) {
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		padding: 12px 40px;
	}
}

.filter-bar-modern__categories {
	display: flex;
	gap: 8px;
	overflow-x: auto;
	scrollbar-width: none;
	-ms-overflow-style: none;

	&::-webkit-scrollbar {
		display: none;
	}
}

.components-button.filter-bar-modern__pill {
	flex-shrink: 0;
	border-radius: 20px;
	padding: 6px 16px;
	font-size: $font-body-small;
	font-weight: 500;
	color: var( --studio-gray-80 );
	background: var( --studio-gray-0 );
	border: 1px solid var( --studio-gray-10 );

	&:hover {
		background: var( --studio-gray-5 );
	}

	&.is-active {
		background: var( --studio-blue-50 );
		color: var( --studio-white );
		border-color: var( --studio-blue-50 );
	}
}

.filter-bar-modern__controls {
	display: flex;
	gap: 8px;
	align-items: center;
}

.filter-bar-modern__tier-select {
	height: 40px;
	border: 1px solid var( --studio-gray-10 );
	border-radius: 4px;
	padding: 0 12px;
	font-size: $font-body-small;
	background: var( --studio-white );
	color: var( --studio-gray-80 );
	cursor: pointer;

	&:focus {
		border-color: var( --studio-blue-50 );
		outline: none;
		box-shadow: 0 0 0 1px var( --studio-blue-50 );
	}
}

// SearchThemes overrides within the filter bar
.filter-bar-modern .search-themes-card {
	flex: 1;
	min-width: 200px;
}
```

**Step 5: Run tests to verify they pass**

```bash
yarn test-client client/my-sites/themes/filter-bar-modern/test/index.test.tsx
```

Expected: 4 tests PASS.

**Step 6: Lint and commit**

```bash
yarn eslint --fix client/my-sites/themes/filter-bar-modern/index.tsx
yarn eslint --fix client/my-sites/themes/filter-bar-modern/test/index.test.tsx
yarn stylelint client/my-sites/themes/filter-bar-modern/style.scss
yarn prettier --write client/my-sites/themes/filter-bar-modern/
git add client/my-sites/themes/filter-bar-modern/
git commit -m "feat(themes): add FilterBarModern component"
```

---

### Task 2.2: Integrate FilterBarModern into ThemeShowcase

**Depends on:** Task 2.1

**Files:**
- Modify: `client/my-sites/themes/theme-showcase.jsx:584-741`

**Context:** The render method has two blocks we need to conditionally replace:
1. `div.themes__controls` (lines 688-721) — search + tier dropdown
2. `div.themes__filters` (lines 722-738) — category tabs

When `isModern` is true, we render `FilterBarModern` instead of both blocks.

**Step 1: Add imports**

At the top of `theme-showcase.jsx`, add:

```jsx
import FilterBarModern from './filter-bar-modern';
import { useIsThemeShowcaseModernEnabled } from './hooks/use-is-theme-showcase-modern-enabled';
```

⚠️ **NOTE:** `ThemeShowcase` is a class component, so we can't call `useIsThemeShowcaseModernEnabled()` directly. Two options:
1. Convert the flag check to use `config.isEnabled()` + `this.props.isLoggedIn` directly (simpler for class component).
2. Create a tiny wrapper HOC or use `connect` to inject the prop.

**Recommended:** Use option 1. In the render method, compute:

```jsx
const isModern = config.isEnabled( 'themes/showcase-modern' ) && ! isLoggedIn;
```

The `config` import is already at the top of the file (line 2). The `isLoggedIn` variable is already destructured in render (line 590).

**Step 2: Add conditional rendering in the render method**

Inside the `! isCollectionView && (` block (starting at line 671), replace the inner content. The current structure is:

```jsx
{ ! isCollectionView && (
	<>
		{ isLoggedIn && ( <InView ... /> ) }
		<div className="themes__controls"> ... </div>
	</>
) }
```

Replace with:

```jsx
{ ! isCollectionView && (
	<>
		{ isLoggedIn && (
			<InView ... />  { /* keep exactly as-is */ }
		) }
		{ isModern ? (
			<FilterBarModern
				categories={ Object.values( tabFilters ) }
				selectedCategory={ this.getSelectedTabFilter().key }
				onCategorySelect={ ( category ) =>
					this.onFilterClick(
						Object.values( tabFilters ).find(
							( tabFilter ) => tabFilter.key === category.key
						)
					)
				}
				tiers={ tiers }
				selectedTier={ tier }
				onTierSelect={ this.onTierSelectFilter }
				searchQuery={ search }
				onSearch={ this.doSearch }
				showTierFilter={ !! tabFilters && premiumThemesEnabled && ! isMultisite }
			/>
		) : (
			<div className={ clsx( 'themes__controls', { ... } ) }>
				{ /* existing controls code, unchanged */ }
			</div>
		) }
	</>
) }
```

⚠️ **IMPORTANT:** Keep ALL existing code in the `else` branch. Do not delete or modify the v1 controls — they're the fallback.

**Step 3: Add `search` prop to ThemeShowcaseHeader**

In the render method (around line 656), add `search` to the `ThemeShowcaseHeader` props if not already done in Task 1.4:

```jsx
<ThemeShowcaseHeader
	canonicalUrl={ canonicalUrl }
	filter={ this.props.filter }
	tier={ this.props.tier }
	vertical={ this.props.vertical }
	search={ search }
	isCollectionView={ isCollectionView }
	noIndex={ isCollectionView }
	isSiteECommerceFreeTrial={ isSiteECommerceFreeTrial }
/>
```

**Step 4: Run existing tests to verify no regressions**

```bash
yarn test-client client/my-sites/themes/test/logged-out.jsx
```

Expected: All existing tests PASS.

**Step 5: Lint and commit**

```bash
yarn eslint --fix client/my-sites/themes/theme-showcase.jsx
git add client/my-sites/themes/theme-showcase.jsx
git commit -m "feat(themes): integrate FilterBarModern into ThemeShowcase"
```

---

### Task 2.3: Theme Card Modern Styling

**Depends on:** Task 1.2 (needs the feature flag hook)

**Files:**
- Modify: `client/my-sites/themes/theme-showcase.jsx` (add class to container)
- Modify: `client/my-sites/themes/theme-showcase.scss` (add `.is-modern` card overrides)

**Context:** The theme cards are rendered by `ThemeBlock` in `client/components/themes-list/index.jsx:258-304`, which renders `<Theme>` which renders `<ThemeCard>` from `@automattic/design-picker`. We don't modify the card component itself — we add a CSS class to the parent container and use CSS descendant selectors.

**Step 1: Add `is-modern` class to the showcase container**

In `theme-showcase.jsx` render(), the container div is at line 650:

```jsx
const classnames = clsx( 'theme-showcase', {
	'is-collection-view': isCollectionView,
} );
```

Add the modern flag:

```jsx
const isModern = config.isEnabled( 'themes/showcase-modern' ) && ! isLoggedIn;

const classnames = clsx( 'theme-showcase', {
	'is-collection-view': isCollectionView,
	'is-modern': isModern,
} );
```

⚠️ **NOTE:** If you already computed `isModern` in Task 2.2, reuse it. Don't compute it twice.

**Step 2: Add CSS overrides**

In `client/my-sites/themes/theme-showcase.scss`, add at the end of the file:

```scss
// Modern theme card overrides (logged-out redesign)
.theme-showcase.is-modern {
	.theme-card {
		border-radius: 8px;
	}

	.theme-card__image {
		border-radius: 8px 8px 0 0;
	}

	.theme-card__info {
		padding: 12px 16px;
	}

	.theme-card__info-title {
		font-size: $font-body;
		font-weight: 500;
	}

	// Hide style variation swatches for logged-out modern view
	.theme-card__info-style-variations {
		display: none;
	}
}
```

⚠️ **VERIFY:** Check the actual CSS class names used by `ThemeCard` from `@automattic/design-picker`. Inspect `packages/design-picker/src/components/theme-card/style.scss` (or similar path) to confirm the correct class names. The names above are educated guesses — adjust to match the actual classes.

**Step 3: Run existing tests**

```bash
yarn test-client client/my-sites/themes/test/logged-out.jsx
```

Expected: PASS.

**Step 4: Lint and commit**

```bash
yarn eslint --fix client/my-sites/themes/theme-showcase.jsx
yarn stylelint client/my-sites/themes/theme-showcase.scss
git add client/my-sites/themes/theme-showcase.jsx client/my-sites/themes/theme-showcase.scss
git commit -m "feat(themes): add is-modern card styling for theme showcase"
```

---

## Milestone 3: Banners + Polish (~2-3 days)

Goal: Add marketing banners, polish responsive layout, add analytics.

### Task 3.1: AI Builder Banner

**Depends on:** Milestone 2 complete

**Files:**
- Create: `client/my-sites/themes/banners-modern/ai-builder-banner.tsx`
- Create: `client/my-sites/themes/banners-modern/style.scss`
- Create: `client/my-sites/themes/banners-modern/test/ai-builder-banner.test.tsx`

**Context:** Follow the `TelexBanner` pattern from `client/my-sites/plugins/plugins-banners/telex-banner/`. Same visual structure (text + illustration, full-width, 16px radius), adapted for themes context with AI website builder CTA.

**Step 1: Write the failing test**

Create `client/my-sites/themes/banners-modern/test/ai-builder-banner.test.tsx`:

```tsx
/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import { setStore } from 'calypso/state/redux-store';
import AIBuilderBanner from '../ai-builder-banner';

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

function renderWithStore() {
	const store = createReduxStore( {}, ( state: unknown ) => state );
	setStore( store );
	return render(
		<ReduxProvider store={ store }>
			<AIBuilderBanner />
		</ReduxProvider>
	);
}

describe( 'AIBuilderBanner', () => {
	test( 'renders title and description', () => {
		renderWithStore();
		expect( screen.getByRole( 'heading' ) ).toBeVisible();
	} );

	test( 'renders a CTA link', () => {
		renderWithStore();
		const cta = screen.getByRole( 'link' );
		expect( cta ).toBeVisible();
		expect( cta ).toHaveAttribute( 'href', expect.stringContaining( '/start' ) );
	} );
} );
```

**Step 2: Run tests to verify they fail**

```bash
yarn test-client client/my-sites/themes/banners-modern/test/ai-builder-banner.test.tsx
```

Expected: FAIL.

**Step 3: Write the component**

Create `client/my-sites/themes/banners-modern/ai-builder-banner.tsx`:

```tsx
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { preventWidows } from 'calypso/lib/formatting';
import { getSectionName } from 'calypso/state/ui/selectors';

import './style.scss';

const AIBuilderBanner = () => {
	const sectionName = useSelector( getSectionName );

	const trackClick = useCallback( () => {
		recordTracksEvent( 'calypso_themeshowcase_ai_builder_banner_click', {
			section: sectionName,
		} );
	}, [ sectionName ] );

	return (
		<div className="ai-builder-banner">
			<div className="ai-builder-banner__content">
				<h2 className="ai-builder-banner__title">
					{ __( 'Build your site with AI' ) }
				</h2>
				<p className="ai-builder-banner__description">
					{ preventWidows(
						__(
							'Describe your dream site and our AI builder will create it for you — complete with content, images, and a theme.'
						)
					) }
				</p>
				<Button
					className="ai-builder-banner__cta"
					variant="primary"
					href="/start/ai"
					onClick={ trackClick }
				>
					{ __( 'Try the AI builder' ) }
				</Button>
			</div>
			<div className="ai-builder-banner__illustration" aria-hidden="true" />
		</div>
	);
};

export default AIBuilderBanner;
```

⚠️ **VERIFY:** Check the correct AI builder URL. Search: `grep -r "start/ai\|ai.*builder.*href\|ai.*website.*builder" client/landing/stepper/ client/my-sites/`. The URL may be `/start/ai`, `/start/with-ai`, or something else.

**Step 4: Write the styles**

Create `client/my-sites/themes/banners-modern/style.scss`:

```scss
@import "@automattic/typography/styles/variables";
@import "@wordpress/base-styles/breakpoints";

// AI Builder Banner — follows TelexBanner pattern
.ai-builder-banner {
	display: flex;
	flex-direction: column;
	background-color: var( --color-neutral-0 );
	margin-block: 24px;
	padding: 32px 24px;
	border-radius: 16px;
	border: 1px solid var( --studio-blue-50 );
	position: relative;
	overflow: hidden;

	@media ( min-width: $break-small ) {
		flex-direction: row;
		align-items: center;
		padding: 56px 40px;
		min-height: 280px;
	}
}

.ai-builder-banner__content {
	flex: 1;
	z-index: 1;
}

.ai-builder-banner__title {
	font-size: rem( 32px );
	font-weight: 400;
	line-height: 1.1;
	margin: 0 0 12px;
	font-family: $brand-serif;

	@media ( min-width: $break-small ) {
		font-size: rem( 40px );
	}
}

.ai-builder-banner__description {
	font-size: $font-body-large;
	line-height: 1.5;
	margin-bottom: 24px;
	color: var( --studio-gray-90 );
	max-width: 450px;
}

.components-button.ai-builder-banner__cta {
	width: fit-content;
	font-size: $font-body;
	border-radius: 4px;
	font-weight: 500;
	padding: 12px 24px;
	height: auto;
}

.ai-builder-banner__illustration {
	display: none;

	@media ( min-width: $break-small ) {
		display: block;
		flex: 0 0 40%;
		min-height: 200px;
		border-radius: 12px;
		background: var( --studio-blue-5 );
		margin-inline-start: 32px;
	}
}

// DIFM Banner — follows BusinessPlanBanner pattern
.difm-banner {
	display: flex;
	flex-direction: column;
	background-color: var( --studio-gray-100 );
	color: var( --studio-white );
	margin-block: 24px;
	padding: 32px 24px;
	border-radius: 16px;
	position: relative;
	overflow: hidden;

	@media ( min-width: $break-small ) {
		flex-direction: row;
		align-items: center;
		padding: 56px 40px;
	}
}

.difm-banner__content {
	flex: 1;
	z-index: 1;
}

.difm-banner__title {
	font-size: rem( 32px );
	font-weight: 400;
	line-height: 1.1;
	margin: 0 0 12px;
	font-family: $brand-serif;
	color: var( --studio-white );

	@media ( min-width: $break-small ) {
		font-size: rem( 40px );
	}
}

.difm-banner__description {
	font-size: $font-body-large;
	line-height: 1.5;
	margin-bottom: 16px;
	color: var( --studio-gray-5 );
	max-width: 450px;
}

.difm-banner__features {
	list-style: none;
	padding: 0;
	margin: 0 0 24px;

	li {
		font-size: $font-body;
		line-height: 1.6;
		color: var( --studio-gray-10 );
		padding-inline-start: 20px;
		position: relative;

		&::before {
			content: "✓";
			position: absolute;
			inset-inline-start: 0;
			color: var( --studio-green-40 );
		}
	}
}

.components-button.difm-banner__cta {
	width: fit-content;
	font-size: $font-body;
	border-radius: 4px;
	font-weight: 500;
	padding: 12px 24px;
	height: auto;
	color: var( --studio-white );
	border: 1px solid var( --studio-white );
	background: transparent;

	&:hover {
		background: rgba( 255, 255, 255, 0.1 );
		color: var( --studio-white );
	}
}

.difm-banner__illustration-container {
	display: none;

	@media ( min-width: $break-small ) {
		display: block;
		flex: 0 0 35%;
		margin-inline-start: 32px;
	}
}
```

**Step 5: Run tests to verify they pass**

```bash
yarn test-client client/my-sites/themes/banners-modern/test/ai-builder-banner.test.tsx
```

Expected: 2 tests PASS.

**Step 6: Lint and commit**

```bash
yarn eslint --fix client/my-sites/themes/banners-modern/ai-builder-banner.tsx
yarn eslint --fix client/my-sites/themes/banners-modern/test/ai-builder-banner.test.tsx
yarn stylelint client/my-sites/themes/banners-modern/style.scss
yarn prettier --write client/my-sites/themes/banners-modern/
git add client/my-sites/themes/banners-modern/
git commit -m "feat(themes): add AI builder banner for modern themes showcase"
```

---

### Task 3.2: DIFM Banner

**Depends on:** Task 3.1 (shared style.scss)

**Files:**
- Create: `client/my-sites/themes/banners-modern/difm-banner.tsx`
- Create: `client/my-sites/themes/banners-modern/test/difm-banner.test.tsx`

**Context:** Follow the `BusinessPlanBanner` pattern from `client/my-sites/plugins/plugins-banners/business-plan-banner/index.tsx`. Dark background, feature list, CTA to DIFM service.

**Step 1: Write the failing test**

Create `client/my-sites/themes/banners-modern/test/difm-banner.test.tsx`:

```tsx
/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import { setStore } from 'calypso/state/redux-store';
import DIFMBanner from '../difm-banner';

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

function renderWithStore() {
	const store = createReduxStore( {}, ( state: unknown ) => state );
	setStore( store );
	return render(
		<ReduxProvider store={ store }>
			<DIFMBanner />
		</ReduxProvider>
	);
}

describe( 'DIFMBanner', () => {
	test( 'renders title', () => {
		renderWithStore();
		expect( screen.getByRole( 'heading' ) ).toBeVisible();
	} );

	test( 'renders CTA linking to DIFM service', () => {
		renderWithStore();
		const cta = screen.getByRole( 'link' );
		expect( cta ).toBeVisible();
		expect( cta ).toHaveAttribute( 'href', expect.stringContaining( 'website-design-service' ) );
	} );

	test( 'renders feature list', () => {
		renderWithStore();
		expect( screen.getAllByRole( 'listitem' ).length ).toBeGreaterThanOrEqual( 2 );
	} );
} );
```

**Step 2: Run tests to verify they fail**

```bash
yarn test-client client/my-sites/themes/banners-modern/test/difm-banner.test.tsx
```

**Step 3: Write the component**

Create `client/my-sites/themes/banners-modern/difm-banner.tsx`:

```tsx
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSectionName } from 'calypso/state/ui/selectors';

import './style.scss';

const DIFMBanner = () => {
	const sectionName = useSelector( getSectionName );

	const trackClick = useCallback( () => {
		recordTracksEvent( 'calypso_themeshowcase_difm_banner_click', {
			section: sectionName,
		} );
	}, [ sectionName ] );

	return (
		<div className="difm-banner">
			<div className="difm-banner__content">
				<h2 className="difm-banner__title">
					{ __( 'Let us build it for you' ) }
				</h2>
				<p className="difm-banner__description">
					{ __( 'Get a professionally designed site, built by our WordPress experts.' ) }
				</p>
				<ul className="difm-banner__features">
					<li>{ __( 'Custom layouts for up to 5 pages' ) }</li>
					<li>{ __( 'Professional design aligned with your brand' ) }</li>
					<li>{ __( 'Built on WordPress.com for easy self-management' ) }</li>
				</ul>
				<Button
					className="difm-banner__cta"
					href="https://wordpress.com/website-design-service/?ref=themes-showcase"
					onClick={ trackClick }
				>
					{ __( 'Get started' ) }
				</Button>
			</div>
			<div className="difm-banner__illustration-container" aria-hidden="true" />
		</div>
	);
};

export default DIFMBanner;
```

**Step 4: Run tests**

```bash
yarn test-client client/my-sites/themes/banners-modern/test/difm-banner.test.tsx
```

Expected: 3 tests PASS.

**Step 5: Lint and commit**

```bash
yarn eslint --fix client/my-sites/themes/banners-modern/difm-banner.tsx
yarn eslint --fix client/my-sites/themes/banners-modern/test/difm-banner.test.tsx
yarn prettier --write client/my-sites/themes/banners-modern/
git add client/my-sites/themes/banners-modern/difm-banner.tsx client/my-sites/themes/banners-modern/test/difm-banner.test.tsx
git commit -m "feat(themes): add DIFM banner for modern themes showcase"
```

---

### Task 3.3: Contextual Plan Banner

**Depends on:** Task 3.1

**Files:**
- Create: `client/my-sites/themes/banners-modern/plan-banner.tsx`
- Create: `client/my-sites/themes/banners-modern/test/plan-banner.test.tsx`

**Context:** Uses the existing `UpsellNudge` from `client/blocks/upsell-nudge/`. Shows when the user filters by a specific plan tier (e.g., "Premium"). Different copy per tier.

**Step 1: Write the failing test**

Create `client/my-sites/themes/banners-modern/test/plan-banner.test.tsx`:

```tsx
/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import { setStore } from 'calypso/state/redux-store';
import PlanBanner from '../plan-banner';

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );
jest.mock( 'calypso/blocks/upsell-nudge', () => {
	return function MockUpsellNudge( props: { title: string; description: string } ) {
		return (
			<div data-testid="upsell-nudge">
				<div>{ props.title }</div>
				<div>{ props.description }</div>
			</div>
		);
	};
} );

function renderWithStore( props = {} ) {
	const store = createReduxStore( {}, ( state: unknown ) => state );
	setStore( store );
	return render(
		<ReduxProvider store={ store }>
			<PlanBanner tier="premium" { ...props } />
		</ReduxProvider>
	);
}

describe( 'PlanBanner', () => {
	test( 'renders an upsell nudge for premium tier', () => {
		renderWithStore( { tier: 'premium' } );
		expect( screen.getByTestId( 'upsell-nudge' ) ).toBeVisible();
	} );

	test( 'renders an upsell nudge for free tier', () => {
		renderWithStore( { tier: 'free' } );
		expect( screen.getByTestId( 'upsell-nudge' ) ).toBeVisible();
	} );

	test( 'returns null when tier is "all"', () => {
		const { container } = renderWithStore( { tier: 'all' } );
		expect( container.firstChild ).toBeNull();
	} );
} );
```

**Step 2: Run tests to verify they fail**

```bash
yarn test-client client/my-sites/themes/banners-modern/test/plan-banner.test.tsx
```

**Step 3: Write the component**

Create `client/my-sites/themes/banners-modern/plan-banner.tsx`:

```tsx
import { __ } from '@wordpress/i18n';
import UpsellNudge from 'calypso/blocks/upsell-nudge';

interface PlanBannerProps {
	tier: string;
}

const PlanBanner = ( { tier }: PlanBannerProps ) => {

	// Define tier-specific copy inside the component so translations work.
	const configs: Record< string, { title: string; description: string } > = {
		free: {
			title: __( 'Get more with a paid plan' ),
			description: __(
				'Unlock premium themes, advanced customization, and priority support.'
			),
		},
		premium: {
			title: __( 'Premium themes included with your plan' ),
			description: __(
				'Access beautifully designed themes crafted by professional designers.'
			),
		},
		marketplace: {
			title: __( 'Partner themes for every need' ),
			description: __(
				'Explore themes from trusted WordPress partners, designed for specific industries.'
			),
		},
	};

	const config = configs[ tier ];
	if ( ! config || tier === 'all' ) {
		return null;
	}

	return (
		<UpsellNudge
			className="plan-banner"
			event={ `calypso_themeshowcase_plan_banner_${ tier }` }
			title={ config.title }
			description={ config.description }
			showIcon
		/>
	);
};

export default PlanBanner;
```

⚠️ **VERIFY:** Check the `UpsellNudge` props interface at `client/blocks/upsell-nudge/index.tsx`. It may require additional props like `plan`, `feature`, `href`, or `callToAction`. Read the file and adjust props accordingly.

**Step 4: Run tests**

```bash
yarn test-client client/my-sites/themes/banners-modern/test/plan-banner.test.tsx
```

Expected: 3 tests PASS.

**Step 5: Lint and commit**

```bash
yarn eslint --fix client/my-sites/themes/banners-modern/plan-banner.tsx
yarn eslint --fix client/my-sites/themes/banners-modern/test/plan-banner.test.tsx
yarn prettier --write client/my-sites/themes/banners-modern/
git add client/my-sites/themes/banners-modern/plan-banner.tsx client/my-sites/themes/banners-modern/test/plan-banner.test.tsx
git commit -m "feat(themes): add contextual plan banner for modern themes showcase"
```

---

### Task 3.4: Integrate Banners into ThemeShowcase

**Depends on:** Tasks 3.1, 3.2, 3.3

**Files:**
- Modify: `client/my-sites/themes/theme-showcase.jsx`

**Context:** Banners need to be interleaved **between grid rows**, not rendered above the grid. The existing pattern in `ThemesList` (`client/components/themes-list/index.jsx`) renders banners as **siblings to theme cards** inside the CSS Grid container, using `grid-column: 1/-1` to span all columns and `grid-row-start: N` to position at specific rows (see `SecondUpsellNudge` at row 7, `WooDesignWithAIBanner` at row 2).

Do NOT use `renderBanner()` — that renders banners above the entire grid. Instead, pass banners as children through `ThemesSelection` → `ThemesList`, and position them with CSS Grid properties.

**Step 1: Add imports**

At the top of `theme-showcase.jsx`:

```jsx
import AIBuilderBanner from './banners-modern/ai-builder-banner';
import DIFMBanner from './banners-modern/difm-banner';
import PlanBanner from './banners-modern/plan-banner';
```

**Step 2: Pass banners as children to ThemesSelection**

In the render method, find where `ThemesSelection` is rendered (inside `allThemes()` method, around line 413-446). When `isModern` is true, pass the banner components as children — the same way `ShowcaseThemeCollection` is already rendered as a child:

```jsx
{ isModern && (
	<>
		<AIBuilderBanner />
		{ tier !== 'all' && <PlanBanner tier={ tier } /> }
		<DIFMBanner />
	</>
) }
```

⚠️ **VERIFY:** Read the `allThemes()` method and the `ThemesSelection` / `ThemesList` components to confirm how children are rendered inside the CSS Grid. The banners should become siblings of theme cards within `div.themes-list`.

**Step 3: Add CSS Grid positioning for banners**

In `client/my-sites/themes/banners-modern/style.scss`, add grid positioning rules so banners span the full grid width and appear at specific row positions:

```scss
// Grid interleaving — banners as siblings to theme cards inside .themes-list
.themes-list .ai-builder-banner,
.themes-list .difm-banner,
.themes-list .plan-banner {
	grid-column: 1 / -1;
}

.themes-list .ai-builder-banner {
	grid-row-start: 4; // After first row of 3 cards
}

.themes-list .difm-banner {
	grid-row-start: 10; // After ~3 rows of cards
}
```

⚠️ **NOTE:** Grid row numbers depend on column count. Verify the correct rows visually at different breakpoints.

⚠️ **IMPORTANT:** Do NOT modify `renderBanner()` — leave existing banner logic untouched. The modern banners use a completely different rendering path (CSS Grid children).

**Step 3: Run existing tests**

```bash
yarn test-client client/my-sites/themes/test/logged-out.jsx
```

Expected: PASS.

**Step 4: Lint and commit**

```bash
yarn eslint --fix client/my-sites/themes/theme-showcase.jsx
git add client/my-sites/themes/theme-showcase.jsx
git commit -m "feat(themes): integrate modern banners into theme showcase"
```

---

### Task 3.5: Analytics Events

**Depends on:** Task 3.4

**Files:**
- Modify: `client/my-sites/themes/filter-bar-modern/index.tsx`
- Modify: `client/my-sites/themes/hero-modern/index.tsx`

**Step 1: Add tracks events to FilterBarModern**

In `filter-bar-modern/index.tsx`, add analytics for filter interactions. Import `recordTracksEvent`:

```tsx
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
```

Add tracking in the category click handler (inside the `Button` onClick):

```tsx
onClick={ () => {
	recordTracksEvent( 'calypso_themeshowcase_modern_category_click', {
		category: category.key,
	} );
	onCategorySelect( category );
} }
```

Add tracking in the tier change handler:

```tsx
onChange={ ( event ) => {
	const tier = tiers.find( ( t ) => t.key === event.target.value );
	if ( tier ) {
		recordTracksEvent( 'calypso_themeshowcase_modern_tier_click', {
			tier: tier.key,
		} );
		onTierSelect( { selectedItem: tier } );
	}
} }
```

⚠️ **NOTE:** Search analytics are already handled by `SearchThemes` (it calls `recordTracksEvent` via its prop). No additional search tracking needed in FilterBarModern.

**Step 2: Add tracks events to HeroModern**

In `hero-modern/index.tsx`, add tracking for the CTA click:

```tsx
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

// Inside the component:
const trackCTAClick = useCallback( () => {
	recordTracksEvent( 'calypso_themeshowcase_modern_hero_cta_click' );
}, [] );

// On the Button:
<Button
	className="hero-modern__cta"
	variant="primary"
	href="/start/ai"
	onClick={ trackCTAClick }
>
```

**Step 3: Lint and commit**

```bash
yarn eslint --fix client/my-sites/themes/filter-bar-modern/index.tsx
yarn eslint --fix client/my-sites/themes/hero-modern/index.tsx
git add client/my-sites/themes/filter-bar-modern/index.tsx client/my-sites/themes/hero-modern/index.tsx
git commit -m "feat(themes): add analytics events for modern theme showcase"
```

---

### Task 3.6: Responsive Polish + Accessibility

**Depends on:** All previous tasks

**Files:**
- Modify: `client/my-sites/themes/hero-modern/style.scss`
- Modify: `client/my-sites/themes/filter-bar-modern/style.scss`
- Modify: `client/my-sites/themes/banners-modern/style.scss`
- Modify: `client/my-sites/themes/theme-showcase.scss`

**Step 1: Test responsive breakpoints**

Start the dev server and test at these widths:
- 320px (small phone)
- 375px (iPhone)
- 768px (tablet)
- 1024px (small desktop)
- 1440px (large desktop)

```bash
yarn start
```

Then visit `http://localhost:3000/themes` in a browser with logged-out state.

**Step 2: Fix responsive issues**

Common things to check and fix:
- Hero: title font size scales down on mobile, illustration hides on small screens
- Filter bar: pills scroll horizontally on mobile, tier dropdown stacks below pills
- Banners: single-column layout on mobile, text doesn't overflow
- Theme grid: cards adjust from 3 columns → 2 → 1

**Step 3: Accessibility audit**

Check:
- All interactive elements are keyboard-navigable (tab through hero CTA, filter pills, tier dropdown, search, banner CTAs)
- Filter pills have proper `aria-pressed` or similar state indication
- Search input has `aria-label`
- Banners have appropriate heading hierarchy (h2, not h1)
- Color contrast meets WCAG AA (use browser dev tools contrast checker)
- Sticky filter bar doesn't trap focus

**Step 4: Lint all modified files**

```bash
yarn stylelint client/my-sites/themes/hero-modern/style.scss
yarn stylelint client/my-sites/themes/filter-bar-modern/style.scss
yarn stylelint client/my-sites/themes/banners-modern/style.scss
yarn stylelint client/my-sites/themes/theme-showcase.scss
```

**Step 5: Run all tests**

```bash
yarn test-client client/my-sites/themes/test/logged-out.jsx
yarn test-client client/my-sites/themes/hero-modern/test/
yarn test-client client/my-sites/themes/filter-bar-modern/test/
yarn test-client client/my-sites/themes/banners-modern/test/
yarn test-client client/my-sites/themes/hooks/test/
```

Expected: All tests PASS.

**Step 6: Commit**

```bash
git add -A client/my-sites/themes/
git commit -m "fix(themes): responsive polish and accessibility fixes for modern showcase"
```

---

## Summary of All New/Modified Files

### New Files
- `client/my-sites/themes/hooks/use-is-theme-showcase-modern-enabled.ts`
- `client/my-sites/themes/hooks/test/use-is-theme-showcase-modern-enabled.test.tsx`
- `client/my-sites/themes/hero-modern/index.tsx`
- `client/my-sites/themes/hero-modern/style.scss`
- `client/my-sites/themes/hero-modern/test/index.test.tsx`
- `client/my-sites/themes/filter-bar-modern/index.tsx`
- `client/my-sites/themes/filter-bar-modern/style.scss`
- `client/my-sites/themes/filter-bar-modern/test/index.test.tsx`
- `client/my-sites/themes/banners-modern/ai-builder-banner.tsx`
- `client/my-sites/themes/banners-modern/difm-banner.tsx`
- `client/my-sites/themes/banners-modern/plan-banner.tsx`
- `client/my-sites/themes/banners-modern/style.scss`
- `client/my-sites/themes/banners-modern/test/ai-builder-banner.test.tsx`
- `client/my-sites/themes/banners-modern/test/difm-banner.test.tsx`
- `client/my-sites/themes/banners-modern/test/plan-banner.test.tsx`

### Modified Files
- `config/development.json` — feature flag `true`
- `config/test.json` — feature flag `true`
- `config/production.json` — feature flag `false`
- `config/stage.json` — feature flag `false`
- `config/horizon.json` — feature flag `false`
- `config/wpcalypso.json` — feature flag `false`
- `client/my-sites/themes/theme-showcase-header.jsx` — conditional hero rendering
- `client/my-sites/themes/theme-showcase.jsx` — conditional filter bar, banner integration, `is-modern` class
- `client/my-sites/themes/theme-showcase.scss` — `.is-modern` card overrides
