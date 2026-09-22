/**
 * @jest-environment jsdom
 */
import {
	adoptWowFunnelSite,
	fetchPendingWowFunnelSite,
	wowFunnelSiteHasCartItems,
} from '../wow-funnel-site';

const mockGet = jest.fn();

jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: { req: { get: ( ...args: unknown[] ) => mockGet( ...args ) } },
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
	 * One unpaid site is allowed at a time, so a different CTA cannot build its own. Remembering
	 * the pending site under the run being entered is what stops create-site from asking for a
	 * second site the server will refuse.
	 */
	it( 'remembers the pending site under the run being entered, not the one that built it', () => {
		const adopted = adoptWowFunnelSite(
			{
				blogId: 111,
				siteSlug: 'site-111.wordpress.com',
				funnelSlug: 'blueprint',
				funnelArgs: { blueprint_slug: 'coachava' },
			},
			'blueprint',
			{ blueprint_slug: 'other' }
		);

		expect( adopted ).toMatchObject( { blogId: 111, funnelSlug: 'blueprint' } );
		expect(
			JSON.parse( window.sessionStorage.getItem( 'wow-funnel-created-site' ) ?? '{}' )
		).toMatchObject( { blogId: 111 } );
	} );
} );
