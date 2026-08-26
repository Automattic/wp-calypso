/**
 * @jest-environment jsdom
 */
import {
	clearWowFunnelSite,
	getRememberedWowFunnelSite,
	getWowFunnelKey,
	wowFunnelSiteIsPaid,
} from '../wow-funnel';

const SESSION_KEY = 'wow-funnel-created-site';

function remember( funnelSlug: string, funnelArgs: Record< string, string >, blogId: number ) {
	window.sessionStorage.setItem(
		SESSION_KEY,
		JSON.stringify( {
			funnelSlug,
			funnelKey: getWowFunnelKey( funnelSlug, funnelArgs ),
			blogId,
			siteSlug: `site-${ blogId }.wordpress.com`,
		} )
	);
}

describe( 'getWowFunnelKey', () => {
	it( 'separates runs that build different things', () => {
		expect( getWowFunnelKey( 'blueprint', { blueprint_slug: 'coachava' } ) ).not.toBe(
			getWowFunnelKey( 'blueprint', { blueprint_slug: 'other' } )
		);
	} );

	it( 'is stable regardless of arg order', () => {
		expect( getWowFunnelKey( 'blueprint', { a: '1', b: '2' } ) ).toBe(
			getWowFunnelKey( 'blueprint', { b: '2', a: '1' } )
		);
	} );
} );

describe( 'getRememberedWowFunnelSite', () => {
	beforeEach( () => {
		window.sessionStorage.clear();
	} );

	it( 'resumes the site when the same CTA is re-entered', () => {
		remember( 'blueprint', { blueprint_slug: 'coachava' }, 111 );

		expect(
			getRememberedWowFunnelSite( 'blueprint', { blueprint_slug: 'coachava' } )?.blogId
		).toBe( 111 );
	} );

	/**
	 * Two theme CTAs share the funnel slug and differ only in the blueprint. Matching on the slug
	 * alone sent the customer back to a site built from the theme they did not pick.
	 */
	it( 'does not resume a site built from a different blueprint', () => {
		remember( 'blueprint', { blueprint_slug: 'coachava' }, 111 );

		expect( getRememberedWowFunnelSite( 'blueprint', { blueprint_slug: 'other' } ) ).toBeNull();
	} );

	it( 'forgets the site once the run is cleared', () => {
		remember( 'blueprint', { blueprint_slug: 'coachava' }, 111 );
		clearWowFunnelSite();

		expect( getRememberedWowFunnelSite( 'blueprint', { blueprint_slug: 'coachava' } ) ).toBeNull();
	} );

	it( 'ignores a remembered site written before funnelKey existed', () => {
		window.sessionStorage.setItem(
			SESSION_KEY,
			JSON.stringify( { funnelSlug: 'blueprint', blogId: 111, siteSlug: 'old.wordpress.com' } )
		);

		expect( getRememberedWowFunnelSite( 'blueprint', { blueprint_slug: 'coachava' } ) ).toBeNull();
	} );
} );

describe( 'wowFunnelSiteIsPaid', () => {
	/**
	 * The funnel exists to sell a plan for the site it builds. Resuming a site that already has
	 * one puts a second plan in the cart for a site that does not need it.
	 */
	it( 'is true for a site holding a paid plan', () => {
		expect( wowFunnelSiteIsPaid( { plan: { is_free: false } } ) ).toBe( true );
	} );

	it( 'is false for a free site', () => {
		expect( wowFunnelSiteIsPaid( { plan: { is_free: true } } ) ).toBe( false );
	} );

	it( 'is false when the site or its plan is unknown', () => {
		expect( wowFunnelSiteIsPaid( undefined ) ).toBe( false );
		expect( wowFunnelSiteIsPaid( {} ) ).toBe( false );
	} );
} );
