import { FAMILY_PRIORITY, getFamilyFromSlug } from '../families';
import type { Family } from '../families';

describe( 'FAMILY_PRIORITY', () => {
	test( 'orders A4A → Woo → Jetpack → Other', () => {
		expect( FAMILY_PRIORITY ).toEqual( [ 'a4a', 'woo', 'jetpack', 'other' ] );
	} );
} );

describe( 'getFamilyFromSlug', () => {
	test.each< [ string, Family ] >( [
		[ 'jetpack', 'jetpack' ],
		[ 'jetpack-backup', 'jetpack' ],
		[ 'jetpack-protect', 'jetpack' ],
		[ 'jetpack-boost', 'jetpack' ],
		[ 'jetpack-search', 'jetpack' ],
		[ 'jetpack-social', 'jetpack' ],
		[ 'jetpack-videopress', 'jetpack' ],
	] )( 'classifies %s as jetpack', ( slug, expected ) => {
		expect( getFamilyFromSlug( slug ) ).toBe( expected );
	} );

	test.each< [ string, Family ] >( [
		[ 'woocommerce', 'woo' ],
		[ 'woocommerce-payments', 'woo' ],
		[ 'woocommerce-experimental', 'woo' ],
	] )( 'classifies %s as woo', ( slug, expected ) => {
		expect( getFamilyFromSlug( slug ) ).toBe( expected );
	} );

	test.each< [ string, Family ] >( [
		[ 'automattic-for-agencies-client', 'a4a' ],
		[ 'automattic-for-agencies', 'a4a' ],
		[ 'automattic-client', 'a4a' ],
	] )( 'classifies %s as a4a', ( slug, expected ) => {
		expect( getFamilyFromSlug( slug ) ).toBe( expected );
	} );

	test.each< [ string ] >( [
		[ 'unknown-plugin' ],
		[ 'my-custom-plugin' ],
		[ 'jetpacky' ],
		[ 'wpcom-something' ],
		[ '' ],
	] )( 'classifies %s as other', ( slug ) => {
		expect( getFamilyFromSlug( slug ) ).toBe( 'other' );
	} );

	test( 'jetpacky is not jetpack family (requires exact slug or jetpack- prefix)', () => {
		expect( getFamilyFromSlug( 'jetpacky' ) ).toBe( 'other' );
	} );
} );
