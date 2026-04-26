/**
 * @jest-environment jsdom
 */

import { getConnectorBranding } from '../connector-branding-config';

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
		expect( branding ).toEqual( defaultBranding );
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
} );
