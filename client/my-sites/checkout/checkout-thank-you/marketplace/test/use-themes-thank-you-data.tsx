/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { fetchSitePurchases } from 'calypso/state/purchases/actions';
import { requestTheme } from 'calypso/state/themes/actions';
import { useThemesThankYouData } from '../use-themes-thank-you-data';

const THEME_SLUG = 'twentytwentyfour';
const mockDispatch = vi.fn();
let mockState = {
	siteId: 1,
	siteSlug: 'example.wordpress.com',
	themeSlug: 'pub/other-theme',
	dotComThemes: [ null ] as Array< { id: string } | null >,
	dotOrgThemes: [ null ] as Array< { id: string } | null >,
	isRequestingSitePurchases: false,
	hasLoadedSitePurchases: true,
	isJetpack: false,
	subscribedThemes: [] as string[],
	hasExternallyManagedThemes: false,
};

vi.mock( '@automattic/calypso-router', () => ( { default: vi.fn() } ) );
vi.mock( 'i18n-calypso', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		useTranslate: () => ( text: string ) => text,
	} )
);
vi.mock( 'calypso/components/data/query-site-purchases', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		useQuerySitePurchases: vi.fn(),
	} )
);
vi.mock( 'calypso/components/data/query-theme', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		useQueryThemes: vi.fn(),
	} )
);
vi.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
	useSelector: ( selector: ( state: typeof mockState ) => unknown ) => selector( mockState ),
} ) );
vi.mock( 'calypso/state/purchases/actions', () => ( {
	fetchSitePurchases: vi.fn( ( siteId: number ) => ( {
		type: 'FETCH_SITE_PURCHASES',
		siteId,
	} ) ),
} ) );
vi.mock( 'calypso/state/purchases/selectors', () => ( {
	hasLoadedSitePurchasesFromServer: ( state: typeof mockState ) => state.hasLoadedSitePurchases,
	isFetchingSitePurchases: ( state: typeof mockState ) => state.isRequestingSitePurchases,
} ) );
vi.mock( 'calypso/state/sites/selectors', () => ( {
	isJetpackSite: ( state: typeof mockState ) => state.isJetpack,
	getSiteOption: ( state: typeof mockState ) => state.themeSlug,
} ) );
vi.mock( 'calypso/state/themes/actions', () => ( {
	clearActivated: vi.fn( ( siteId: number ) => ( { type: 'THEMES_CLEAR_ACTIVATED', siteId } ) ),
	requestTheme: vi.fn( ( themeId: string, siteId: string ) => ( {
		type: 'THEME_REQUEST',
		themeId,
		siteId,
	} ) ),
} ) );
vi.mock( 'calypso/state/themes/selectors', () => ( {
	getThemes: ( state: typeof mockState, source: string ) =>
		source === 'wpcom' ? state.dotComThemes : state.dotOrgThemes,
	isMarketplaceThemeSubscribed: ( state: typeof mockState, themeId: string ) =>
		state.subscribedThemes.includes( themeId ),
} ) );
vi.mock( 'calypso/state/themes/selectors/is-externally-managed-theme', () => ( {
	hasExternallyManagedThemes: ( state: typeof mockState ) => state.hasExternallyManagedThemes,
} ) );
vi.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSiteId: ( state: typeof mockState ) => state.siteId,
	getSelectedSiteSlug: ( state: typeof mockState ) => state.siteSlug,
} ) );
vi.mock( '../marketplace-thank-you-theme-section', () => ( {
	ThankYouThemeSection: () => null,
} ) );

const defaultState = { ...mockState };
const renderThemes = ( themeSlugs: string[] = [ THEME_SLUG ] ) =>
	renderHook( () => useThemesThankYouData( themeSlugs, false, null ) );

describe( 'useThemesThankYouData retry', () => {
	beforeEach( () => {
		vi.clearAllMocks();
		mockState = { ...defaultState };
	} );

	test( 'refetches a missing theme from both sources', () => {
		const { result } = renderThemes();

		act( () => result.current.retry() );

		expect( requestTheme ).toHaveBeenCalledWith( THEME_SLUG, 'wpcom' );
		expect( requestTheme ).toHaveBeenCalledWith( THEME_SLUG, 'wporg' );
		expect( mockDispatch ).toHaveBeenCalledWith( {
			type: 'THEME_REQUEST',
			themeId: THEME_SLUG,
			siteId: 'wpcom',
		} );
	} );

	test( 'does not refetch a theme that already loaded from either source', () => {
		mockState.dotComThemes = [ { id: THEME_SLUG } ];
		const { result } = renderThemes();

		act( () => result.current.retry() );

		expect( requestTheme ).not.toHaveBeenCalled();
	} );

	test( 'refetches site purchases even when a failed fetch marked them loaded', () => {
		// The purchases reducer sets hasLoadedSitePurchasesFromServer on failure too, so the
		// flag cannot gate the retry — only an in-flight request should.
		mockState.hasLoadedSitePurchases = true;
		const { result } = renderThemes();

		act( () => result.current.retry() );

		expect( fetchSitePurchases ).toHaveBeenCalledWith( 1 );
	} );

	test( 'skips the purchases refetch while one is in flight', () => {
		mockState.isRequestingSitePurchases = true;
		const { result } = renderThemes();

		act( () => result.current.retry() );
		expect( fetchSitePurchases ).not.toHaveBeenCalled();
	} );

	test( 'reports loaded once purchases arrive for a plain theme purchase', () => {
		mockState.dotComThemes = [ { id: THEME_SLUG } ];
		mockState.hasLoadedSitePurchases = true;
		mockState.isRequestingSitePurchases = false;
		const { result } = renderThemes();

		expect( result.current.isLoaded ).toBe( true );
	} );

	test( 'stays loading while purchases have not loaded yet', () => {
		mockState.hasLoadedSitePurchases = false;
		const { result } = renderThemes();

		expect( result.current.isLoaded ).toBe( false );
	} );
} );
