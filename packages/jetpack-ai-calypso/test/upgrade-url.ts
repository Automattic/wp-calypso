/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { getUpgradeURL, isWpcomSimpleSite } from '../src/logo-generator/lib/upgrade-url';
/**
 * Types
 */
import type { SiteDetails } from '@automattic/data-stores';

const simpleSite = {
	jetpack: false,
	slug: 'simple.wordpress.com',
	domain: 'simple.wordpress.com',
} as SiteDetails;
const jetpackSite = { jetpack: true, slug: 'example.com', domain: 'example.com' } as SiteDetails;

describe( 'isWpcomSimpleSite', () => {
	it( 'is true for a WordPress.com Simple site', () => {
		expect( isWpcomSimpleSite( simpleSite ) ).toBe( true );
	} );

	it( 'is false for a Jetpack-connected site, which includes Atomic', () => {
		expect( isWpcomSimpleSite( jetpackSite ) ).toBe( false );
	} );

	it( 'is false when there is no site', () => {
		expect( isWpcomSimpleSite( undefined ) ).toBe( false );
	} );
} );

describe( 'getUpgradeURL', () => {
	it( 'sends a Simple site to the WordPress.com plans page', () => {
		const url = new URL(
			getUpgradeURL( { siteDetails: simpleSite, nextTierSlug: 'jetpack_ai_yearly' } )
		);

		expect( url.pathname ).toBe( '/plans/simple.wordpress.com' );
		expect( url.searchParams.get( 'redirect_to' ) ).toBe( window.location.href );
	} );

	it( 'sends a Jetpack site to checkout for the next Jetpack AI tier', () => {
		const url = new URL(
			getUpgradeURL( { siteDetails: jetpackSite, nextTierSlug: 'jetpack_ai_yearly' } )
		);

		expect( url.pathname ).toBe( '/checkout/example.com/jetpack_ai_yearly' );
		expect( url.searchParams.get( 'redirect_to' ) ).toBe( window.location.href );
	} );
} );
