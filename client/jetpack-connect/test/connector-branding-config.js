/**
 * @jest-environment jsdom
 */

import { getConnectorBranding, getConnectorLogoUrl } from '../connector-branding-config';

describe( 'getConnectorBranding', () => {
	test( 'should return Jetpack branding as the default fallback', () => {
		const branding = getConnectorBranding( [] );
		expect( branding ).toHaveProperty( 'title' );
		expect( branding ).toHaveProperty( 'subtitle' );
		expect( branding ).toHaveProperty( 'permissions' );
		expect( branding.permissions.length ).toBeGreaterThan( 0 );
	} );

	test( 'should return specific branding for jetpack-boost', () => {
		const branding = getConnectorBranding( [ 'jetpack-boost' ] );
		expect( branding.title ).toContain( 'Boost' );
	} );

	test( 'should return specific branding for jetpack-social', () => {
		const branding = getConnectorBranding( [ 'jetpack-social' ] );
		expect( branding.title ).toContain( 'Social' );
	} );

	test( 'should use the first recognized slug when multiple are provided', () => {
		const branding = getConnectorBranding( [ 'unknown-plugin', 'jetpack-search' ] );
		expect( branding.title ).toContain( 'Search' );
	} );

	test( 'should fall back to default for unrecognized slugs', () => {
		const defaultBranding = getConnectorBranding( [] );
		const branding = getConnectorBranding( [ 'some-unknown-plugin' ] );
		expect( branding.title ).toEqual( defaultBranding.title );
		expect( branding.subtitle ).toEqual( defaultBranding.subtitle );
	} );

	test( 'should fall back to default when called with no arguments', () => {
		const branding = getConnectorBranding();
		expect( branding ).toHaveProperty( 'title' );
		expect( branding ).toHaveProperty( 'subtitle' );
		expect( branding ).toHaveProperty( 'permissions' );
	} );

	test( 'each branding entry should have icon and label in permissions', () => {
		const slugs = [
			'jetpack',
			'jetpack-boost',
			'jetpack-social',
			'jetpack-search',
			'jetpack-videopress',
			'jetpack-backup',
		];

		for ( const slug of slugs ) {
			const branding = getConnectorBranding( [ slug ] );
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
