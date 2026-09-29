/**
 * @jest-environment jsdom
 */
import { createSite } from '@automattic/onboarding';
import {
	adoptWowFunnelSite,
	discardPendingWowFunnelSite,
	fetchPendingWowFunnelSite,
	forgetWowFunnelRun,
	startWowFunnelSite,
	wowFunnelSiteHasCartItems,
} from '../wow-funnel-site';

const mockGet = jest.fn();
const mockPost = jest.fn();

jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: {
		req: {
			get: ( ...args: unknown[] ) => mockGet( ...args ),
			post: ( ...args: unknown[] ) => mockPost( ...args ),
		},
	},
} ) );

// The barrels this module pulls in for site creation are irrelevant to the throttle helpers, and
// loading them for real drags i18n-calypso into the test.
jest.mock( '@automattic/onboarding', () => ( {
	ONBOARDING_FLOW: 'onboarding',
	createSite: jest.fn(),
} ) );
jest.mock( '@automattic/data-stores/src/site/types', () => ( {
	Visibility: { PublicNotIndexed: 0 },
} ) );

describe( 'fetchPendingWowFunnelSite', () => {
	beforeEach( () => {
		mockGet.mockReset();
	} );

	it( 'reports the unpaid site the customer left standing', async () => {
		mockGet.mockResolvedValue( {
			pending: true,
			blog_id: 111,
			site_slug: 'site-111.wordpress.com',
			funnel_slug: 'blueprint',
			funnel_args: { blueprint_slug: 'coachava' },
		} );

		await expect( fetchPendingWowFunnelSite() ).resolves.toEqual( {
			blogId: 111,
			siteSlug: 'site-111.wordpress.com',
			funnelSlug: 'blueprint',
			funnelArgs: { blueprint_slug: 'coachava' },
		} );
	} );

	/**
	 * The server drops its own pointer as it reads it, so a site since paid for or reverted
	 * answers "none" — which is what lets a fresh run begin.
	 */
	it( 'reports nothing when the previous run has ended', async () => {
		mockGet.mockResolvedValue( { pending: false } );

		await expect( fetchPendingWowFunnelSite() ).resolves.toBeNull();
	} );

	it( 'treats a failed lookup as nothing pending, leaving /sites/new the final say', async () => {
		mockGet.mockRejectedValue( new Error( 'network' ) );

		await expect( fetchPendingWowFunnelSite() ).resolves.toBeNull();
	} );
} );

describe( 'wowFunnelSiteHasCartItems', () => {
	beforeEach( () => {
		mockGet.mockReset();
	} );

	/**
	 * This is what separates the two ways of resuming: a cart with something in it means the
	 * customer reached checkout and did not pay, so they go back there rather than to plans.
	 */
	it( 'is true when the abandoned cart still holds products', async () => {
		mockGet.mockResolvedValue( { products: [ { product_slug: 'business-bundle' } ] } );

		await expect( wowFunnelSiteHasCartItems( 111 ) ).resolves.toBe( true );
	} );

	it( 'is false for an empty cart', async () => {
		mockGet.mockResolvedValue( { products: [] } );

		await expect( wowFunnelSiteHasCartItems( 111 ) ).resolves.toBe( false );
	} );

	it( 'is false when the cart cannot be read, so the customer lands on plans', async () => {
		mockGet.mockRejectedValue( new Error( 'network' ) );

		await expect( wowFunnelSiteHasCartItems( 111 ) ).resolves.toBe( false );
	} );
} );

describe( 'adoptWowFunnelSite', () => {
	beforeEach( () => {
		window.sessionStorage.clear();
	} );

	/**
	 * Remembering the pending site for the run being resumed is what stops create-site from asking
	 * for a second site the server will refuse.
	 */
	it( 'remembers the pending site for the run being resumed', () => {
		const adopted = adoptWowFunnelSite(
			{
				blogId: 111,
				siteSlug: 'site-111.wordpress.com',
				funnelSlug: 'blueprint',
				funnelArgs: { blueprint_slug: 'coachava' },
			},
			'blueprint',
			{ blueprint_slug: 'coachava' }
		);

		expect( adopted ).toMatchObject( { blogId: 111, funnelSlug: 'blueprint' } );
		expect(
			JSON.parse( window.sessionStorage.getItem( 'wow-funnel-created-site' ) ?? '{}' )
		).toMatchObject( { blogId: 111 } );
	} );
} );

describe( 'discardPendingWowFunnelSite', () => {
	beforeEach( () => {
		mockPost.mockReset();
	} );

	it( 'names the site the customer was shown, so the server can refuse any other', async () => {
		mockPost.mockResolvedValue( { discarded: true } );

		await expect( discardPendingWowFunnelSite( 111 ) ).resolves.toBe( 'discarded' );
		expect( mockPost.mock.calls[ 0 ][ 0 ] ).toMatchObject( { path: '/wow-funnel/pending/discard' } );
		expect( mockPost.mock.calls[ 0 ][ 1 ] ).toEqual( { blog_id: 111 } );
	} );

	it.each( [
		[ 'wow_funnel_discard_not_pending', 'gone' ],
		[ 'wow_funnel_discard_rate_limited', 'rate_limited' ],
		[ 'wow_funnel_discard_not_ready', 'not_ready' ],
		[ 'rest_no_route', 'unavailable' ],
		[ 'something_else', 'failed' ],
	] )( 'reads a %s refusal as %s', async ( code, expected ) => {
		mockPost.mockRejectedValue( { error: code, statusCode: 400 } );

		await expect( discardPendingWowFunnelSite( 111 ) ).resolves.toBe( expected );
	} );
} );

describe( 'startWowFunnelSite when the server holds a pending site', () => {
	const mockCreateSite = createSite as jest.Mock;

	beforeEach( () => {
		// The module keeps a resolved start per run in memory, so an earlier test's site would be
		// handed straight back without ever consulting the pending site.
		forgetWowFunnelRun( 'blueprint', { blueprint_slug: 'coachava' } );
		window.sessionStorage.clear();
		mockGet.mockReset();
		mockCreateSite.mockReset();
		mockCreateSite.mockRejectedValue( new Error( 'wow_funnel_site_pending' ) );
	} );

	it( 'takes over the site when it is this run\'s own', async () => {
		mockGet.mockResolvedValue( {
			pending: true,
			blog_id: 111,
			site_slug: 'site-111.wordpress.com',
			funnel_slug: 'blueprint',
			funnel_args: { blueprint_slug: 'coachava' },
		} );

		await expect(
			startWowFunnelSite( { funnelSlug: 'blueprint', funnelArgs: { blueprint_slug: 'coachava' } } )
		).resolves.toMatchObject( { blogId: 111 } );
	} );

	/**
	 * A different run carrying on over the site would never run its own follow-up — a blueprint
	 * run on a default site waits forever for an import nobody queued.
	 */
	it( 'refuses a site built by a different run', async () => {
		mockGet.mockResolvedValue( {
			pending: true,
			blog_id: 111,
			site_slug: 'site-111.wordpress.com',
			funnel_slug: 'default',
			funnel_args: {},
		} );

		await expect(
			startWowFunnelSite( { funnelSlug: 'blueprint', funnelArgs: { blueprint_slug: 'coachava' } } )
		).rejects.toThrow( 'another setup' );
		expect( window.sessionStorage.getItem( 'wow-funnel-created-site' ) ).toBeNull();
	} );
} );
