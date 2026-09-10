/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { getUpgradeURL, shouldUpgradePlan } from '../src/logo-generator/lib/upgrade-url';
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

describe( 'shouldUpgradePlan', () => {
	it( 'is true for a Simple site that lacks the feature', () => {
		expect( shouldUpgradePlan( simpleSite, 'feature' ) ).toBe( true );
	} );

	it( 'is false for a Simple site that only ran out of requests', () => {
		expect( shouldUpgradePlan( simpleSite, 'requests' ) ).toBe( false );
	} );

	it( 'is false for a Jetpack-connected site, which includes Atomic', () => {
		expect( shouldUpgradePlan( jetpackSite, 'feature' ) ).toBe( false );
	} );

	it( 'is false when there is no site', () => {
		expect( shouldUpgradePlan( undefined, 'feature' ) ).toBe( false );
	} );
} );

describe( 'getUpgradeURL', () => {
	const redirectTo = 'http://localhost/home/some-site';

	it( 'sends a Simple site without the feature to the WordPress.com plans page', () => {
		const url = new URL(
			getUpgradeURL( {
				siteDetails: simpleSite,
				nextTierSlug: 'jetpack_ai_yearly',
				reason: 'feature',
				redirectTo,
			} )
		);

		expect( url.pathname ).toBe( '/plans/simple.wordpress.com' );
		expect( url.searchParams.get( 'redirect_to' ) ).toBe( redirectTo );
	} );

	it( 'keeps the Jetpack AI tier checkout for a Simple site that ran out of requests', () => {
		const url = new URL(
			getUpgradeURL( {
				siteDetails: simpleSite,
				nextTierSlug: 'jetpack_ai_yearly',
				reason: 'requests',
				redirectTo,
			} )
		);

		expect( url.pathname ).toBe( '/checkout/simple.wordpress.com/jetpack_ai_yearly' );
	} );

	it( 'sends a Jetpack site to checkout for the next Jetpack AI tier', () => {
		const url = new URL(
			getUpgradeURL( {
				siteDetails: jetpackSite,
				nextTierSlug: 'jetpack_ai_yearly',
				reason: 'feature',
				redirectTo,
			} )
		);

		expect( url.pathname ).toBe( '/checkout/example.com/jetpack_ai_yearly' );
		expect( url.searchParams.get( 'redirect_to' ) ).toBe( redirectTo );
	} );
} );
