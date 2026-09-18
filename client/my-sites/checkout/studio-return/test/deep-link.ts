/**
 * @jest-environment jsdom
 */

import { buildStudioCheckoutReturnUrl, openStudioCheckoutReturn } from '../deep-link';

const STUDIO_SITE_ID = 'b419d647-95e0-4b32-95fc-6ee255aa465d';

describe( 'buildStudioCheckoutReturnUrl', () => {
	it( 'builds a wp-studio:// URL for the checkout-return action', () => {
		const url = buildStudioCheckoutReturnUrl( {
			studioSiteId: STUDIO_SITE_ID,
			checkoutResult: 'success',
			studioReturnTo: 'publish-site',
		} );

		expect( url ).toBe(
			`wp-studio://checkout-return?studioSiteId=${ STUDIO_SITE_ID }&checkoutResult=success&studioReturnTo=publish-site`
		);
	} );

	it( 'carries the cancelled result', () => {
		expect(
			buildStudioCheckoutReturnUrl( {
				studioSiteId: STUDIO_SITE_ID,
				checkoutResult: 'cancelled',
			} )
		).toBe(
			`wp-studio://checkout-return?studioSiteId=${ STUDIO_SITE_ID }&checkoutResult=cancelled`
		);
	} );

	it( 'omits studioReturnTo rather than serialising it as undefined', () => {
		const url = buildStudioCheckoutReturnUrl( {
			studioSiteId: STUDIO_SITE_ID,
			checkoutResult: 'success',
		} );

		expect( url ).not.toContain( 'studioReturnTo' );
		expect( url ).not.toContain( 'undefined' );
	} );

	// This, not any format check on the way in, is what stops a crafted checkout URL from
	// controlling the deep link.
	it( 'percent-encodes values so they cannot inject extra params', () => {
		const hostile = 'abc&checkoutResult=success&evil=1';
		const url = buildStudioCheckoutReturnUrl( {
			studioSiteId: hostile,
			checkoutResult: 'cancelled',
		} );

		const query = new URLSearchParams( url.slice( url.indexOf( '?' ) + 1 ) );
		expect( query.get( 'studioSiteId' ) ).toBe( hostile );
		expect( query.getAll( 'checkoutResult' ) ).toEqual( [ 'cancelled' ] );
		expect( query.get( 'evil' ) ).toBeNull();
	} );

	it( 'carries nothing beyond what Studio acts on', () => {
		const url = buildStudioCheckoutReturnUrl( {
			studioSiteId: STUDIO_SITE_ID,
			checkoutResult: 'success',
		} );

		// Studio verifies entitlement against the API, so no purchase details cross the boundary.
		expect( url ).not.toContain( 'receiptId' );
		expect( url ).not.toContain( 'remoteSiteId' );
		expect( url ).not.toContain( 'quantity' );
	} );
} );

describe( 'openStudioCheckoutReturn', () => {
	beforeEach( () => {
		Object.defineProperty( window, 'location', {
			value: { href: 'https://wordpress.com/checkout/studio-return' },
			writable: true,
		} );
	} );

	it( 'navigates to the deep link', () => {
		openStudioCheckoutReturn( {
			studioSiteId: STUDIO_SITE_ID,
			checkoutResult: 'cancelled',
		} );

		expect( window.location.href ).toBe(
			`wp-studio://checkout-return?studioSiteId=${ STUDIO_SITE_ID }&checkoutResult=cancelled`
		);
	} );
} );
