/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import gotoCheckoutPage from '../stats-purchase-checkout-redirect';

// `calypso-products` reads the named export at import time, so both shapes have to resolve to
// the same mock or the module graph fails to load.
jest.mock( '@automattic/calypso-config', () => {
	const isEnabled = jest.fn();
	return { __esModule: true, default: { isEnabled }, isEnabled };
} );
jest.mock( 'calypso/lib/analytics/tracks', () => ( { recordTracksEvent: jest.fn() } ) );
jest.mock( '../../utils', () => ( { trackStatsAnalyticsEvent: jest.fn() } ) );

const ADMIN_URL = 'https://example.com/wp-admin/';
const SITE_SLUG = 'example.com';

/** Ask for the URL rather than the redirect, which `redirect: false` returns directly. */
const checkoutUrl = ( overrides = {} ) =>
	new URL(
		gotoCheckoutPage( {
			from: 'jetpack-stats-pricing-grid',
			type: 'commercial',
			siteSlug: SITE_SLUG,
			siteId: 1234,
			adminUrl: ADMIN_URL,
			redirect: false,
			...overrides,
		} ) as unknown as string
	);

/** Run inside wp-admin (Odyssey) rather than Calypso. */
const inWpAdmin = ( enabled: boolean ) =>
	( config.isEnabled as jest.Mock ).mockImplementation(
		( feature: string ) => feature === 'is_running_in_jetpack_site' && enabled
	);

describe( 'gotoCheckoutPage — site with no connection', () => {
	beforeEach( () => inWpAdmin( true ) );

	it( 'checks out siteless when there is no site id yet', () => {
		const url = checkoutUrl( { siteId: null } );

		expect( url.pathname ).toBe( '/checkout/jetpack/jetpack_stats_yearly' );
	} );

	it( 'asks WordPress.com to connect the site after payment', () => {
		const url = checkoutUrl( { siteId: null } );

		// Without this the purchase completes against no site and the licence is never attached.
		expect( url.searchParams.get( 'connect_after_checkout' ) ).toBe( 'true' );
		expect( url.searchParams.get( 'from_site_slug' ) ).toBe( SITE_SLUG );
		expect( url.searchParams.get( 'admin_url' ) ).toBe( ADMIN_URL );
	} );

	it( 'carries the chosen views tier', () => {
		const url = checkoutUrl( { siteId: null, quantity: 50000 } );

		expect( url.pathname ).toBe( '/checkout/jetpack/jetpack_stats_yearly:-q-50000' );
	} );

	it( 'does not scope checkout to a site it cannot name', () => {
		const url = checkoutUrl( { siteId: null } );

		expect( url.searchParams.get( 'site' ) ).toBeNull();
	} );
} );

describe( 'gotoCheckoutPage — connected site', () => {
	beforeEach( () => inWpAdmin( true ) );

	it( 'scopes checkout to the site once it is fully connected', () => {
		const url = checkoutUrl( { isSiteFullyConnected: true } );

		expect( url.pathname ).toBe( '/checkout/1234/jetpack_stats_yearly' );
		expect( url.searchParams.get( 'connect_after_checkout' ) ).toBeNull();
	} );

	it( 'falls back to siteless checkout while the user connection is missing', () => {
		const url = checkoutUrl( { isSiteFullyConnected: false } );

		expect( url.pathname ).toBe( '/checkout/jetpack/jetpack_stats_yearly' );
		expect( url.searchParams.get( 'connect_after_checkout' ) ).toBe( 'true' );
	} );
} );

describe( 'gotoCheckoutPage — Calypso', () => {
	beforeEach( () => inWpAdmin( false ) );

	it( 'leaves the siteless Calypso path alone', () => {
		// Calypso has its own logged-in session, so the connect-after-checkout hand-off that
		// wp-admin needs would be wrong here.
		const url = checkoutUrl( { siteId: null } );

		expect( url.pathname ).toBe( '/checkout/jetpack/jetpack_stats_yearly' );
		expect( url.searchParams.get( 'connect_after_checkout' ) ).toBeNull();
		expect( url.searchParams.get( 'admin_url' ) ).toBeNull();
	} );

	it( 'uses the site slug when the site is known', () => {
		const url = checkoutUrl();

		expect( url.pathname ).toBe( `/checkout/${ SITE_SLUG }/jetpack_stats_yearly` );
	} );
} );
