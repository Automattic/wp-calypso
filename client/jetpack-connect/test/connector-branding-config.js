/**
 * @jest-environment jsdom
 */

import { getConnectorBranding } from '../connector-branding-config';

describe( 'getConnectorBranding', () => {
	test( 'should return logo + permissions on every result', () => {
		const branding = getConnectorBranding( [] );
		expect( branding ).toHaveProperty( 'logo' );
		expect( branding ).toHaveProperty( 'permissions' );
		expect( branding.permissions.length ).toBeGreaterThan( 0 );
	} );

	test( 'should fall back to defaults when called with no arguments', () => {
		const branding = getConnectorBranding();
		expect( branding ).toHaveProperty( 'logo' );
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
