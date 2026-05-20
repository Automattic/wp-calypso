/**
 * @jest-environment jsdom
 */

import { getConnectorFeatureCards, getSecondaryAdminFeatureCards } from '../feature-cards';

describe( 'getSecondaryAdminFeatureCards', () => {
	test( 'returns a Jetpack card with SSO when only jetpack is installed', () => {
		const { cards } = getSecondaryAdminFeatureCards( [ 'jetpack' ] );
		expect( cards ).toHaveLength( 1 );
		expect( cards[ 0 ].id ).toBe( 'jetpack' );
		expect( cards[ 0 ].title ).toBe( 'Jetpack' );
		expect( cards[ 0 ].bullets.join( ' ' ) ).toContain( 'SSO' );
		expect( cards[ 0 ].bullets.join( ' ' ) ).toContain( 'activity log' );
	} );

	test( 'returns a Woo card when only woocommerce is installed', () => {
		const { cards } = getSecondaryAdminFeatureCards( [ 'woocommerce' ] );
		expect( cards ).toHaveLength( 1 );
		expect( cards[ 0 ].id ).toBe( 'woo' );
		expect( cards[ 0 ].title ).toBe( 'WooCommerce' );
		expect( cards[ 0 ].bullets.join( ' ' ) ).toContain( 'Woo mobile app' );
	} );

	test( 'returns multiple cards when jetpack and woocommerce are installed', () => {
		const { cards } = getSecondaryAdminFeatureCards( [ 'woocommerce', 'jetpack' ] );
		expect( cards.length ).toBeGreaterThanOrEqual( 2 );
		const ids = cards.map( ( c ) => c.id );
		expect( ids ).toContain( 'woo' );
		expect( ids ).toContain( 'jetpack' );
	} );

	test( 'returns a per-plugin Jetpack card when a single sub-plugin is installed', () => {
		const { cards } = getSecondaryAdminFeatureCards( [ 'jetpack-backup' ] );
		expect( cards ).toHaveLength( 1 );
		expect( cards[ 0 ].id ).toBe( 'jetpack-backup' );
		expect( cards[ 0 ].title ).toBe( 'Jetpack VaultPress Backup' );
		expect( cards[ 0 ].bullets.join( ' ' ) ).toContain( 'activity log' );
	} );

	test( 'returns the "other" fallback card for empty plugin list', () => {
		const { cards } = getSecondaryAdminFeatureCards( [] );
		expect( cards ).toHaveLength( 1 );
		expect( cards[ 0 ].id ).toBe( 'other' );
		expect( cards[ 0 ].bullets.join( ' ' ) ).toContain( 'WordPress.com' );
	} );

	test( 'every card includes a logo for known families', () => {
		const { cards } = getSecondaryAdminFeatureCards( [ 'jetpack', 'woocommerce' ] );
		for ( const card of cards ) {
			expect( card.logo ).toBeDefined();
		}
	} );

	test( 'defaults to "other" card when called with no arguments', () => {
		const { cards } = getSecondaryAdminFeatureCards();
		expect( cards ).toHaveLength( 1 );
		expect( cards[ 0 ].id ).toBe( 'other' );
	} );
} );

describe( 'getConnectorFeatureCards', () => {
	test( 'returns cards for known plugin slugs', () => {
		const { cards } = getConnectorFeatureCards( [ 'jetpack' ] );
		expect( cards.length ).toBeGreaterThan( 0 );
		expect( cards[ 0 ].title ).toBe( 'Jetpack' );
	} );

	test( 'returns a fallback card for empty plugin list', () => {
		const { cards } = getConnectorFeatureCards( [] );
		expect( cards.length ).toBeGreaterThan( 0 );
	} );
} );
