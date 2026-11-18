/**
 * @vitest-environment jsdom
 */
import { vi } from 'vitest';
import { STAT_TYPE_REFERRERS, STAT_TYPE_TOP_POSTS } from 'calypso/my-sites/stats/constants';
import { DATE_RANGE_GATES, getUpgradeUrl, isStatTypeGated } from '../stats-gates';

const SITE_ID = 123;

const mocks = vi.hoisted( () => ( { state: {} } ) );

// On in production, which the Stats v2 tiers below assume.
vi.mock( '@automattic/calypso-config', async ( importOriginal ) => {
	const actual = await importOriginal();
	const isEnabled = ( flag ) => flag === 'stats/paid-wpcom-v3' || actual.isEnabled( flag );
	const config = Object.assign( ( key ) => actual.default( key ), actual.default, { isEnabled } );
	return { ...actual, default: config, isEnabled };
} );
vi.mock( '../../lib/selectors/get-state', () => ( { default: () => mocks.state } ) );

const simpleSite = {
	ID: SITE_ID,
	URL: 'https://example.wordpress.com',
	jetpack: false,
	options: {},
};
const jetpackSite = { ID: SITE_ID, URL: 'https://example.com', jetpack: true, options: {} };

const seed = ( site, features = [] ) => {
	mocks.state = {
		sites: {
			items: { [ SITE_ID ]: site },
			features: { [ SITE_ID ]: { data: { active: features } } },
		},
	};
};

const locked = () => ( {
	topPosts: isStatTypeGated( SITE_ID, STAT_TYPE_TOP_POSTS ),
	referrers: isStatTypeGated( SITE_ID, STAT_TYPE_REFERRERS ),
	ranges: Object.keys( DATE_RANGE_GATES ).filter( ( id ) =>
		isStatTypeGated( SITE_ID, DATE_RANGE_GATES[ id ] )
	),
} );

const NOTHING_LOCKED = { topPosts: false, referrers: false, ranges: [] };

describe( 'isStatTypeGated', () => {
	// The WordPress.com feature slugs Jetpack seeds into `sites.features`.
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
			[ 'stats-basic' ],
			{ topPosts: false, referrers: true, ranges: [ 'last_90_days', 'last_12_months' ] },
		],
		[ 'a site on paid stats', [ 'stats-paid' ], NOTHING_LOCKED ],
		[ 'a site on legacy free stats', [ 'stats-free' ], NOTHING_LOCKED ],
		[ 'a site on commercial stats', [ 'stats-commercial' ], NOTHING_LOCKED ],
	] )( 'locks what Stats v2 locks for %s', ( _, features, expected ) => {
		seed( simpleSite, features );

		expect( locked() ).toEqual( expected );
	} );

	it( 'locks nothing the widget shows on a Jetpack site without a Stats purchase', () => {
		seed( jetpackSite );

		expect( locked() ).toEqual( NOTHING_LOCKED );
	} );
} );

describe( 'getUpgradeUrl', () => {
	it( 'opens checkout for the plan that unlocks the stat, coming back to this page', () => {
		seed( simpleSite );

		const url = new URL( getUpgradeUrl( SITE_ID, STAT_TYPE_REFERRERS ) );

		expect( url.origin + url.pathname ).toBe(
			'https://wordpress.com/checkout/example.wordpress.com/personal-bundle'
		);
		expect( url.searchParams.get( 'redirect_to' ) ).toBe( window.location.href );
	} );

	it( 'has no answer for a site the state does not know', () => {
		mocks.state = {};

		expect( getUpgradeUrl( SITE_ID, STAT_TYPE_REFERRERS ) ).toBeUndefined();
	} );
} );
