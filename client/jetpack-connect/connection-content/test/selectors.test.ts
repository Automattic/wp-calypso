import {
	MAX_FEATURED_CARDS,
	getFeatureSelection,
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
	test( 'returns up to MAX_FEATURED_CARDS families by default', () => {
		expect( MAX_FEATURED_CARDS ).toBe( 3 );
		expect(
			getTopFamilies( [
				'automattic-for-agencies-client',
				'woocommerce',
				'jetpack',
				'unknown-plugin',
			] )
		).toEqual( [ 'a4a', 'woo', 'jetpack' ] );
	} );

	test( 'respects the max argument when provided', () => {
		expect(
			getTopFamilies( [ 'automattic-for-agencies-client', 'woocommerce', 'jetpack' ], 2 )
		).toEqual( [ 'a4a', 'woo' ] );
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

describe( 'getFeatureSelection', () => {
	test( 'returns the only-other fallback card when no plugins are active', () => {
		expect( getFeatureSelection( [] ) ).toEqual( { cardKeys: [ 'other' ] } );
	} );

	test( 'returns the only-other fallback card for unknown-only plugin sets', () => {
		expect( getFeatureSelection( [ 'unknown-plugin', 'another-unknown' ] ) ).toEqual( {
			cardKeys: [ 'other' ],
		} );
	} );

	test( 'features the highest-priority known family for single-plugin inputs', () => {
		expect( getFeatureSelection( [ 'automattic-for-agencies-client' ] ) ).toEqual( {
			cardKeys: [ 'a4a' ],
		} );
	} );

	test( 'collapses to a single family card when every active plugin is in that family', () => {
		expect( getFeatureSelection( [ 'woocommerce', 'woocommerce-payments' ] ) ).toEqual( {
			cardKeys: [ 'woo' ],
		} );
	} );

	test( 'features one card per top-priority family in priority order', () => {
		expect( getFeatureSelection( [ 'woocommerce', 'jetpack' ] ) ).toEqual( {
			cardKeys: [ 'woo', 'jetpack' ],
		} );
	} );

	test( 'features all three known families when present', () => {
		// Default max is 3: A4A on top (full-width in the layout), Woo and
		// Jetpack share the row below.
		expect(
			getFeatureSelection( [ 'automattic-for-agencies-client', 'woocommerce', 'jetpack' ] )
		).toEqual( { cardKeys: [ 'a4a', 'woo', 'jetpack' ] } );
	} );

	test( 'collapses multiple individual Jetpack plugins into the generic Jetpack card', () => {
		expect(
			getFeatureSelection( [
				'automattic-for-agencies-client',
				'woocommerce',
				'jetpack-boost',
				'jetpack-search',
			] )
		).toEqual( { cardKeys: [ 'a4a', 'woo', 'jetpack' ] } );
	} );

	test( 'respects the max argument', () => {
		expect(
			getFeatureSelection( [ 'automattic-for-agencies-client', 'woocommerce', 'jetpack' ], 2 )
		).toEqual( { cardKeys: [ 'a4a', 'woo' ] } );
		expect( getFeatureSelection( [ 'automattic-for-agencies-client', 'woocommerce' ], 1 ) ).toEqual(
			{ cardKeys: [ 'a4a' ] }
		);
	} );

	test( 'features the known family card and ignores unknown-family slugs', () => {
		expect( getFeatureSelection( [ 'jetpack', 'unknown-plugin' ] ) ).toEqual( {
			cardKeys: [ 'jetpack' ],
		} );
	} );

	test( 'collapses to the generic Jetpack card when the full Jetpack plugin is present', () => {
		expect( getFeatureSelection( [ 'jetpack' ] ) ).toEqual( { cardKeys: [ 'jetpack' ] } );
		expect( getFeatureSelection( [ 'jetpack', 'jetpack-boost' ] ) ).toEqual( {
			cardKeys: [ 'jetpack' ],
		} );
	} );

	test( 'overrides the family card with the per-plugin card for a single individual Jetpack plugin', () => {
		expect( getFeatureSelection( [ 'jetpack-backup' ] ) ).toEqual( {
			cardKeys: [ 'jetpack-backup' ],
		} );
		expect( getFeatureSelection( [ 'jetpack-protect' ] ) ).toEqual( {
			cardKeys: [ 'jetpack-protect' ],
		} );
		expect( getFeatureSelection( [ 'jetpack-boost' ] ) ).toEqual( {
			cardKeys: [ 'jetpack-boost' ],
		} );
		expect( getFeatureSelection( [ 'jetpack-search' ] ) ).toEqual( {
			cardKeys: [ 'jetpack-search' ],
		} );
		expect( getFeatureSelection( [ 'jetpack-social' ] ) ).toEqual( {
			cardKeys: [ 'jetpack-social' ],
		} );
		expect( getFeatureSelection( [ 'jetpack-videopress' ] ) ).toEqual( {
			cardKeys: [ 'jetpack-videopress' ],
		} );
	} );

	test( 'falls back to the generic Jetpack card for a single but unrecognised individual Jetpack plugin', () => {
		expect( getFeatureSelection( [ 'jetpack-newthing' ] ) ).toEqual( { cardKeys: [ 'jetpack' ] } );
	} );

	test( 'collapses to the generic Jetpack card for two-or-more individual Jetpack plugins', () => {
		expect( getFeatureSelection( [ 'jetpack-backup', 'jetpack-boost' ] ) ).toEqual( {
			cardKeys: [ 'jetpack' ],
		} );
	} );

	test( 'pairs a per-plugin Jetpack card with another family card', () => {
		expect( getFeatureSelection( [ 'woocommerce', 'jetpack-boost' ] ) ).toEqual( {
			cardKeys: [ 'woo', 'jetpack-boost' ],
		} );
		expect( getFeatureSelection( [ 'automattic-for-agencies-client', 'jetpack-search' ] ) ).toEqual(
			{ cardKeys: [ 'a4a', 'jetpack-search' ] }
		);
	} );
} );
