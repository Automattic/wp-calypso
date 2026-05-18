import { getFeatureCardData } from '../family-features';
import type { FeatureCardKey } from '../family-features';

const ALL_KEYS: FeatureCardKey[] = [
	'a4a',
	'woo',
	'jetpack',
	'jetpack-backup',
	'jetpack-protect',
	'jetpack-boost',
	'jetpack-search',
	'jetpack-social',
	'jetpack-videopress',
	'other',
];

describe( 'getFeatureCardData', () => {
	test( 'returns a non-empty title and at least two bullets for every card key', () => {
		for ( const key of ALL_KEYS ) {
			const data = getFeatureCardData( key );
			expect( data.title.length ).toBeGreaterThan( 0 );
			expect( data.bullets.length ).toBeGreaterThanOrEqual( 2 );
			for ( const bullet of data.bullets ) {
				expect( bullet.length ).toBeGreaterThan( 0 );
			}
		}
	} );

	test( 'returns the right brand name for each card key', () => {
		expect( getFeatureCardData( 'a4a' ).title ).toBe( 'Automattic for Agencies' );
		expect( getFeatureCardData( 'woo' ).title ).toBe( 'WooCommerce' );
		expect( getFeatureCardData( 'jetpack' ).title ).toBe( 'Jetpack' );
		expect( getFeatureCardData( 'jetpack-backup' ).title ).toBe( 'Jetpack VaultPress Backup' );
		expect( getFeatureCardData( 'jetpack-protect' ).title ).toBe( 'Jetpack Protect' );
		expect( getFeatureCardData( 'jetpack-boost' ).title ).toBe( 'Jetpack Boost' );
		expect( getFeatureCardData( 'jetpack-search' ).title ).toBe( 'Jetpack Search' );
		expect( getFeatureCardData( 'jetpack-social' ).title ).toBe( 'Jetpack Social' );
		expect( getFeatureCardData( 'jetpack-videopress' ).title ).toBe( 'Jetpack VideoPress' );
		expect( getFeatureCardData( 'other' ).title ).toBe( 'Your active plugins' );
	} );
} );
