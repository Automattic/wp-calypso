/**
 * @jest-environment jsdom
 */

import { getConnectorBranding, getConnectorLogoUrl } from '../connector-branding-config';

describe( 'getConnectorBranding', () => {
	test( 'should return "Connect your site" title by default', () => {
		const branding = getConnectorBranding( [] );
		expect( branding.title ).toBe( 'Connect your site' );
		expect( branding ).toHaveProperty( 'subtitle' );
		expect( branding ).toHaveProperty( 'permissions' );
		expect( branding.permissions.length ).toBeGreaterThan( 0 );
	} );

	test( 'should return "Connect your store" title when woocommerce is present', () => {
		expect( getConnectorBranding( [ 'woocommerce' ] ).title ).toBe( 'Connect your store' );
		expect( getConnectorBranding( [ 'jetpack', 'woocommerce-payments' ] ).title ).toBe(
			'Connect your store'
		);
	} );

	test( 'should return "Connect your site" for non-woo plugin slugs', () => {
		for ( const slugs of [
			[ 'jetpack' ],
			[ 'jetpack-boost' ],
			[ 'unknown-plugin', 'jetpack-search' ],
			[ 'automattic-for-agencies' ],
		] ) {
			expect( getConnectorBranding( slugs ).title ).toBe( 'Connect your site' );
		}
	} );

	test( 'should fall back to default when called with no arguments', () => {
		const branding = getConnectorBranding();
		expect( branding.title ).toBe( 'Connect your site' );
		expect( branding ).toHaveProperty( 'subtitle' );
		expect( branding ).toHaveProperty( 'permissions' );
	} );

	test( 'every permission entry should have an icon and a label', () => {
		for ( const slugs of [ [], [ 'jetpack' ], [ 'unknown-plugin' ] ] ) {
			const branding = getConnectorBranding( slugs );
			branding.permissions.forEach( ( perm ) => {
				expect( perm ).toHaveProperty( 'icon' );
				expect( perm ).toHaveProperty( 'label' );
			} );
		}
	} );

	test( 'should include a logo property in every branding result', () => {
		const slugs = [
			[],
			[ 'jetpack' ],
			[ 'jetpack-boost' ],
			[ 'unknown-plugin' ],
			[ 'woocommerce' ],
		];

		for ( const pluginSlugs of slugs ) {
			const branding = getConnectorBranding( pluginSlugs );
			expect( branding ).toHaveProperty( 'logo' );
			expect( typeof branding.logo ).toBe( 'string' );
		}
	} );

	test( 'should resolve the correct composite logo based on plugin families', () => {
		expect( getConnectorBranding( [ 'jetpack' ] ).logo ).toBe( 'jetpack-connect.svg' );
		expect( getConnectorBranding( [ 'woocommerce' ] ).logo ).toBe( 'jetpack-connect-woo.svg' );
		expect( getConnectorBranding( [ 'automattic-for-agencies' ] ).logo ).toBe(
			'jetpack-connect-a8c.svg'
		);
		expect( getConnectorBranding( [ 'woocommerce', 'automattic-for-agencies' ] ).logo ).toBe(
			'jetpack-connect-all.svg'
		);
	} );

	describe( 'permissionsTitle', () => {
		test( 'is a function on every branding result', () => {
			for ( const slugs of [ [], [ 'jetpack' ], [ 'unknown-plugin' ] ] ) {
				const branding = getConnectorBranding( slugs );
				expect( typeof branding.permissionsTitle ).toBe( 'function' );
			}
		} );

		test( 'returns the short variant when called without a siteURL', () => {
			const branding = getConnectorBranding( [] );
			expect( branding.permissionsTitle() ).toBe( 'This connection allows Jetpack to:' );
			expect( branding.permissionsTitle( {} ) ).toBe( 'This connection allows Jetpack to:' );
		} );

		test( 'interpolates the siteURL into the long variant when provided', () => {
			const branding = getConnectorBranding( [] );
			expect( branding.permissionsTitle( { siteURL: 'example.com' } ) ).toBe(
				'This connection on example.com allows Jetpack to:'
			);
		} );
	} );
} );

describe( 'getConnectorLogoUrl', () => {
	test( 'should return default Jetpack logo for empty slugs', () => {
		expect( getConnectorLogoUrl( [] ) ).toBe( 'jetpack-connect.svg' );
	} );

	test( 'should return default Jetpack logo when no arguments provided', () => {
		expect( getConnectorLogoUrl() ).toBe( 'jetpack-connect.svg' );
	} );

	test( 'should return default Jetpack logo for jetpack-only plugins', () => {
		expect( getConnectorLogoUrl( [ 'jetpack' ] ) ).toBe( 'jetpack-connect.svg' );
		expect( getConnectorLogoUrl( [ 'jetpack-boost', 'jetpack-social' ] ) ).toBe(
			'jetpack-connect.svg'
		);
	} );

	test( 'should return Woo logo when woocommerce-prefixed slug is present', () => {
		expect( getConnectorLogoUrl( [ 'woocommerce' ] ) ).toBe( 'jetpack-connect-woo.svg' );
		expect( getConnectorLogoUrl( [ 'woocommerce-payments' ] ) ).toBe( 'jetpack-connect-woo.svg' );
	} );

	test( 'should return A8C logo when automattic-prefixed slug is present', () => {
		expect( getConnectorLogoUrl( [ 'automattic-for-agencies' ] ) ).toBe(
			'jetpack-connect-a8c.svg'
		);
	} );

	test( 'should return combined logo when both Woo and A4A families are present', () => {
		expect( getConnectorLogoUrl( [ 'woocommerce', 'automattic-for-agencies' ] ) ).toBe(
			'jetpack-connect-all.svg'
		);
		expect(
			getConnectorLogoUrl( [ 'jetpack', 'woocommerce-payments', 'automattic-client' ] )
		).toBe( 'jetpack-connect-all.svg' );
	} );

	test( 'should return default for unknown slug prefixes', () => {
		expect( getConnectorLogoUrl( [ 'my-custom-plugin' ] ) ).toBe( 'jetpack-connect.svg' );
	} );
} );
