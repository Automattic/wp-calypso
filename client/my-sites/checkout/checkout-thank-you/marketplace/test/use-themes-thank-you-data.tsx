/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { fetchSitePurchases } from 'calypso/state/purchases/actions';
import { requestTheme } from 'calypso/state/themes/actions';
import { useThemesThankYouData } from '../use-themes-thank-you-data';

const THEME_SLUG = 'twentytwentyfour';
const mockDispatch = jest.fn();
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

jest.mock( '@automattic/calypso-router', () => jest.fn() );
jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( text: string ) => text,
} ) );
jest.mock( 'calypso/components/data/query-site-purchases', () => ( {
	useQuerySitePurchases: jest.fn(),
} ) );
jest.mock( 'calypso/components/data/query-theme', () => ( {
	useQueryThemes: jest.fn(),
} ) );
jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
	useSelector: ( selector: ( state: typeof mockState ) => unknown ) => selector( mockState ),
} ) );
jest.mock( 'calypso/state/purchases/actions', () => ( {
	fetchSitePurchases: jest.fn( ( siteId: number ) => ( {
		type: 'FETCH_SITE_PURCHASES',
		siteId,
	} ) ),
} ) );
jest.mock( 'calypso/state/purchases/selectors', () => ( {
	hasLoadedSitePurchasesFromServer: ( state: typeof mockState ) => state.hasLoadedSitePurchases,
	isFetchingSitePurchases: ( state: typeof mockState ) => state.isRequestingSitePurchases,
} ) );
jest.mock( 'calypso/state/sites/selectors', () => ( {
	isJetpackSite: ( state: typeof mockState ) => state.isJetpack,
	getSiteOption: ( state: typeof mockState ) => state.themeSlug,
} ) );
jest.mock( 'calypso/state/themes/actions', () => ( {
	clearActivated: jest.fn( ( siteId: number ) => ( { type: 'THEMES_CLEAR_ACTIVATED', siteId } ) ),
	requestTheme: jest.fn( ( themeId: string, siteId: string ) => ( {
		type: 'THEME_REQUEST',
		themeId,
		siteId,
	} ) ),
} ) );
jest.mock( 'calypso/state/themes/selectors', () => ( {
	getThemes: ( state: typeof mockState, source: string ) =>
		source === 'wpcom' ? state.dotComThemes : state.dotOrgThemes,
	isMarketplaceThemeSubscribed: ( state: typeof mockState, themeId: string ) =>
		state.subscribedThemes.includes( themeId ),
} ) );
jest.mock( 'calypso/state/themes/selectors/is-externally-managed-theme', () => ( {
	hasExternallyManagedThemes: ( state: typeof mockState ) => state.hasExternallyManagedThemes,
} ) );
jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSiteId: ( state: typeof mockState ) => state.siteId,
	getSelectedSiteSlug: ( state: typeof mockState ) => state.siteSlug,
} ) );
jest.mock( '../marketplace-thank-you-theme-section', () => ( {
	ThankYouThemeSection: () => null,
} ) );

const defaultState = { ...mockState };
const renderThemes = ( themeSlugs: string[] = [ THEME_SLUG ] ) =>
	renderHook( () => useThemesThankYouData( themeSlugs, false, null ) );

describe( 'useThemesThankYouData retry', () => {
	beforeEach( () => {
		jest.clearAllMocks();
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

	test( 'refetches site purchases when they never loaded', () => {
		mockState.hasLoadedSitePurchases = false;
		const { result } = renderThemes();

		act( () => result.current.retry() );

		expect( fetchSitePurchases ).toHaveBeenCalledWith( 1 );
	} );

	test( 'leaves loaded purchases and in-flight requests alone', () => {
		const { result } = renderThemes();

		act( () => result.current.retry() );
		expect( fetchSitePurchases ).not.toHaveBeenCalled();

		mockState.hasLoadedSitePurchases = false;
		mockState.isRequestingSitePurchases = true;
		const { result: fetching } = renderThemes();

		act( () => fetching.current.retry() );
		expect( fetchSitePurchases ).not.toHaveBeenCalled();
	} );
} );
