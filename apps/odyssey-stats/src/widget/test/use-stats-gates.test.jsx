/**
 * @vitest-environment jsdom
 */
import {
	FEATURE_STATS_BASIC,
	FEATURE_STATS_COMMERCIAL,
	FEATURE_STATS_FREE,
	FEATURE_STATS_PAID,
} from '@automattic/calypso-products';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import wpcom from 'calypso/lib/wp';
import { STAT_TYPE_REFERRERS, STAT_TYPE_TOP_POSTS } from 'calypso/my-sites/stats/constants';
import useStatsGates, { DATE_RANGE_GATES, getUpgradeUrl } from '../use-stats-gates';

const SITE_ID = 123;

const mocks = vi.hoisted( () => ( {
	state: {},
	isRunningInJetpackSite: false,
} ) );

vi.mock( 'calypso/lib/wp', () => ( { default: { req: { get: vi.fn() } } } ) );
// On in production, which the Stats v2 tiers below assume.
vi.mock( '@automattic/calypso-config', async ( importOriginal ) => {
	const actual = await importOriginal();
	const isEnabled = ( flag ) => flag === 'stats/paid-wpcom-v3' || actual.isEnabled( flag );
	const config = Object.assign( ( key ) => actual.default( key ), actual.default, { isEnabled } );
	return { ...actual, default: config, isEnabled };
} );
vi.mock( '../../lib/config-api', () => ( {
	default: {
		isEnabled: ( feature ) =>
			feature === 'is_running_in_jetpack_site' && mocks.isRunningInJetpackSite,
	},
	optionalConfig: () => undefined,
} ) );
vi.mock( '../../lib/selectors/get-state', () => ( { default: () => mocks.state } ) );

const simpleSite = {
	ID: SITE_ID,
	URL: 'https://example.wordpress.com',
	jetpack: false,
	options: {},
};
const jetpackSite = { ID: SITE_ID, URL: 'https://example.com', jetpack: true, options: {} };

const seed = ( site, features ) => {
	mocks.state = {
		sites: {
			items: { [ SITE_ID ]: site },
			...( features && { features: { [ SITE_ID ]: { data: { active: features } } } } ),
		},
	};
};

const wrapper = ( { children } ) => {
	const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	return <QueryClientProvider client={ client }>{ children }</QueryClientProvider>;
};

const renderGates = () => renderHook( () => useStatsGates( SITE_ID ), { wrapper } );

/**
 * What the widget locks, given its gates.
 * @param {Object} gates The hook's answer.
 */
const locked = ( gates ) => ( {
	topPosts: gates.isGated( STAT_TYPE_TOP_POSTS ),
	referrers: gates.isGated( STAT_TYPE_REFERRERS ),
	ranges: Object.keys( DATE_RANGE_GATES ).filter( ( id ) =>
		gates.isGated( DATE_RANGE_GATES[ id ] )
	),
} );

const NOTHING_LOCKED = { topPosts: false, referrers: false, ranges: [] };

describe( 'useStatsGates', () => {
	beforeEach( () => {
		vi.clearAllMocks();
		mocks.isRunningInJetpackSite = false;
	} );

	it.each( [
		[
			'a free site',
			[],
			{
				topPosts: true,
				referrers: true,
				ranges: [ 'last_30_days', 'last_90_days', 'last_12_months' ],
			},
		],
		[
			'a site on basic stats',
			[ FEATURE_STATS_BASIC ],
			{ topPosts: false, referrers: true, ranges: [ 'last_90_days', 'last_12_months' ] },
		],
		[ 'a site on paid stats', [ FEATURE_STATS_PAID ], NOTHING_LOCKED ],
		[ 'a site on legacy free stats', [ FEATURE_STATS_FREE ], NOTHING_LOCKED ],
		[ 'a site on commercial stats', [ FEATURE_STATS_COMMERCIAL ], NOTHING_LOCKED ],
	] )( 'locks what Stats v2 locks for %s', ( _, features, expected ) => {
		seed( simpleSite, features );

		const { result } = renderGates();

		expect( result.current.isLoading ).toBe( false );
		expect( locked( result.current ) ).toEqual( expected );
		expect( wpcom.req.get ).not.toHaveBeenCalled();
	} );

	it( 'fetches the features on a Simple site that was not seeded with them', async () => {
		seed( simpleSite );
		wpcom.req.get.mockResolvedValue( { active: [] } );

		const { result } = renderGates();

		// Nothing is locked, nor shown as open, before the answer.
		expect( result.current.isLoading ).toBe( true );
		expect( result.current.isGated( STAT_TYPE_TOP_POSTS ) ).toBe( false );

		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );
		expect( wpcom.req.get ).toHaveBeenCalledWith( `/sites/${ SITE_ID }/features` );
		expect( locked( result.current ) ).toEqual( {
			topPosts: true,
			referrers: true,
			ranges: [ 'last_30_days', 'last_90_days', 'last_12_months' ],
		} );
	} );

	it( 'leaves everything open when the features fail to load, as Stats v2 does', async () => {
		seed( simpleSite );
		wpcom.req.get.mockRejectedValue( new Error( 'http_request_failed' ) );

		const { result } = renderGates();

		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );
		expect( locked( result.current ) ).toEqual( NOTHING_LOCKED );
	} );

	it( 'locks nothing the widget shows on a Jetpack site without a Stats purchase', () => {
		mocks.isRunningInJetpackSite = true;
		seed( jetpackSite );

		const { result } = renderGates();

		expect( result.current.isLoading ).toBe( false );
		expect( locked( result.current ) ).toEqual( NOTHING_LOCKED );
		expect( wpcom.req.get ).not.toHaveBeenCalled();
	} );
} );

describe( 'getUpgradeUrl', () => {
	it( 'opens checkout for the plan that unlocks the stat, coming back to this page', () => {
		seed( simpleSite, [] );

		const url = new URL( getUpgradeUrl( SITE_ID, STAT_TYPE_REFERRERS ) );

		expect( url.origin + url.pathname ).toBe(
			'https://wordpress.com/checkout/example.wordpress.com/personal-bundle'
		);
		expect( url.searchParams.get( 'redirect_to' ) ).toBe( window.location.href );
	} );

	it( 'has no answer for a site the state does not know', () => {
		mocks.state = {};

		expect( getUpgradeUrl( SITE_ID, STAT_TYPE_REFERRERS ) ).toBeNull();
	} );
} );
