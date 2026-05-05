import {
	getOverflowSlugs,
	getPresentFamilies,
	getTopFamilies,
	hasFullJetpack,
	isStore,
} from '../selectors';

describe( 'getPresentFamilies', () => {
	test( 'returns an empty array when no plugins are active', () => {
		expect( getPresentFamilies( [] ) ).toEqual( [] );
	} );

	test( 'orders by priority regardless of input order', () => {
		expect(
			getPresentFamilies( [ 'jetpack', 'woocommerce', 'automattic-for-agencies-client' ] )
		).toEqual( [ 'a4a', 'woo', 'jetpack' ] );
		expect( getPresentFamilies( [ 'unknown', 'jetpack' ] ) ).toEqual( [ 'jetpack', 'other' ] );
	} );

	test( 'deduplicates families when multiple plugins share one', () => {
		expect( getPresentFamilies( [ 'jetpack', 'jetpack-backup', 'jetpack-boost' ] ) ).toEqual( [
			'jetpack',
		] );
		expect( getPresentFamilies( [ 'woocommerce', 'woocommerce-payments' ] ) ).toEqual( [ 'woo' ] );
	} );
} );

describe( 'getTopFamilies', () => {
	test( 'returns at most two families by default', () => {
		expect(
			getTopFamilies( [ 'automattic-for-agencies-client', 'woocommerce', 'jetpack' ] )
		).toEqual( [ 'a4a', 'woo' ] );
	} );

	test( 'respects the max argument when provided', () => {
		expect(
			getTopFamilies(
				[ 'automattic-for-agencies-client', 'woocommerce', 'jetpack', 'unknown-plugin' ],
				3
			)
		).toEqual( [ 'a4a', 'woo', 'jetpack' ] );
		expect( getTopFamilies( [ 'automattic-for-agencies-client', 'woocommerce' ], 1 ) ).toEqual( [
			'a4a',
		] );
	} );

	test( 'returns whatever is present even if fewer than max', () => {
		expect( getTopFamilies( [ 'jetpack' ] ) ).toEqual( [ 'jetpack' ] );
		expect( getTopFamilies( [] ) ).toEqual( [] );
	} );
} );

describe( 'isStore', () => {
	test( 'is true when any Woo-family plugin is active', () => {
		expect( isStore( [ 'woocommerce' ] ) ).toBe( true );
		expect( isStore( [ 'woocommerce-payments' ] ) ).toBe( true );
		expect( isStore( [ 'jetpack', 'woocommerce' ] ) ).toBe( true );
		expect( isStore( [ 'automattic-for-agencies-client', 'woocommerce', 'jetpack' ] ) ).toBe(
			true
		);
	} );

	test( 'is false otherwise', () => {
		expect( isStore( [] ) ).toBe( false );
		expect( isStore( [ 'jetpack' ] ) ).toBe( false );
		expect( isStore( [ 'jetpack-boost', 'unknown' ] ) ).toBe( false );
		expect( isStore( [ 'automattic-for-agencies-client' ] ) ).toBe( false );
	} );
} );

describe( 'hasFullJetpack', () => {
	test( 'is true only when the full Jetpack plugin is present', () => {
		expect( hasFullJetpack( [ 'jetpack' ] ) ).toBe( true );
		expect( hasFullJetpack( [ 'jetpack-backup', 'jetpack' ] ) ).toBe( true );
	} );

	test( 'is false for individual Jetpack plugins only', () => {
		expect( hasFullJetpack( [ 'jetpack-backup' ] ) ).toBe( false );
		expect( hasFullJetpack( [ 'jetpack-protect', 'jetpack-boost' ] ) ).toBe( false );
	} );

	test( 'is false for empty and unknown sets', () => {
		expect( hasFullJetpack( [] ) ).toBe( false );
		expect( hasFullJetpack( [ 'unknown', 'woocommerce' ] ) ).toBe( false );
	} );
} );

describe( 'getOverflowSlugs', () => {
	test( 'returns slugs whose family is not in the featured list', () => {
		expect(
			getOverflowSlugs(
				[ 'automattic-for-agencies-client', 'woocommerce', 'jetpack', 'unknown-plugin' ],
				[ 'a4a', 'woo' ]
			)
		).toEqual( [ 'jetpack', 'unknown-plugin' ] );
	} );

	test( 'returns all slugs when featured list is empty', () => {
		expect( getOverflowSlugs( [ 'jetpack', 'woocommerce' ], [] ) ).toEqual( [
			'jetpack',
			'woocommerce',
		] );
	} );

	test( 'returns no slugs when every family is featured', () => {
		expect(
			getOverflowSlugs(
				[ 'automattic-for-agencies-client', 'woocommerce', 'jetpack' ],
				[ 'a4a', 'woo', 'jetpack' ]
			)
		).toEqual( [] );
	} );
} );
