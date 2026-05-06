import {
	getFeatureSelection,
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

describe( 'getFeatureSelection', () => {
	test( 'returns the only-other fallback card when no plugins are active', () => {
		expect( getFeatureSelection( [] ) ).toEqual( {
			cardKeys: [ 'other' ],
			overflowSlugs: [],
		} );
	} );

	test( 'returns the only-other fallback card when no recognised family is present', () => {
		expect( getFeatureSelection( [ 'unknown-plugin', 'another-unknown' ] ) ).toEqual( {
			cardKeys: [ 'other' ],
			overflowSlugs: [],
		} );
	} );

	test( 'features the highest-priority known family for single-family inputs', () => {
		expect( getFeatureSelection( [ 'automattic-for-agencies-client' ] ) ).toEqual( {
			cardKeys: [ 'a4a' ],
			overflowSlugs: [],
		} );
		expect( getFeatureSelection( [ 'woocommerce', 'woocommerce-payments' ] ) ).toEqual( {
			cardKeys: [ 'woo' ],
			overflowSlugs: [],
		} );
	} );

	test( 'caps featured cards at two and pushes the third family to overflow', () => {
		expect(
			getFeatureSelection( [ 'automattic-for-agencies-client', 'woocommerce', 'jetpack' ] )
		).toEqual( {
			cardKeys: [ 'a4a', 'woo' ],
			overflowSlugs: [ 'jetpack' ],
		} );
	} );

	test( 'respects the max argument', () => {
		expect(
			getFeatureSelection( [ 'automattic-for-agencies-client', 'woocommerce', 'jetpack' ], 3 )
		).toEqual( {
			cardKeys: [ 'a4a', 'woo', 'jetpack' ],
			overflowSlugs: [],
		} );
		expect( getFeatureSelection( [ 'automattic-for-agencies-client', 'woocommerce' ], 1 ) ).toEqual(
			{
				cardKeys: [ 'a4a' ],
				overflowSlugs: [ 'woocommerce' ],
			}
		);
	} );

	test( 'sends unknown-family slugs to overflow when a known family is featured', () => {
		expect( getFeatureSelection( [ 'jetpack', 'unknown-plugin' ] ) ).toEqual( {
			cardKeys: [ 'jetpack' ],
			overflowSlugs: [ 'unknown-plugin' ],
		} );
	} );

	test( 'collapses to the generic Jetpack card when the full Jetpack plugin is present', () => {
		expect( getFeatureSelection( [ 'jetpack' ] ) ).toEqual( {
			cardKeys: [ 'jetpack' ],
			overflowSlugs: [],
		} );
		expect( getFeatureSelection( [ 'jetpack', 'jetpack-boost' ] ) ).toEqual( {
			cardKeys: [ 'jetpack' ],
			overflowSlugs: [],
		} );
	} );

	test( 'overrides the family card with the per-plugin card for a single individual Jetpack plugin', () => {
		expect( getFeatureSelection( [ 'jetpack-backup' ] ) ).toEqual( {
			cardKeys: [ 'jetpack-backup' ],
			overflowSlugs: [],
		} );
		expect( getFeatureSelection( [ 'jetpack-protect' ] ) ).toEqual( {
			cardKeys: [ 'jetpack-protect' ],
			overflowSlugs: [],
		} );
		expect( getFeatureSelection( [ 'jetpack-boost' ] ) ).toEqual( {
			cardKeys: [ 'jetpack-boost' ],
			overflowSlugs: [],
		} );
		expect( getFeatureSelection( [ 'jetpack-search' ] ) ).toEqual( {
			cardKeys: [ 'jetpack-search' ],
			overflowSlugs: [],
		} );
		expect( getFeatureSelection( [ 'jetpack-social' ] ) ).toEqual( {
			cardKeys: [ 'jetpack-social' ],
			overflowSlugs: [],
		} );
		expect( getFeatureSelection( [ 'jetpack-videopress' ] ) ).toEqual( {
			cardKeys: [ 'jetpack-videopress' ],
			overflowSlugs: [],
		} );
	} );

	test( 'falls back to the generic Jetpack card for a single but unrecognised individual Jetpack plugin', () => {
		expect( getFeatureSelection( [ 'jetpack-newthing' ] ) ).toEqual( {
			cardKeys: [ 'jetpack' ],
			overflowSlugs: [],
		} );
	} );

	test( 'collapses to the generic Jetpack card for two-or-more individual Jetpack plugins', () => {
		expect( getFeatureSelection( [ 'jetpack-backup', 'jetpack-boost' ] ) ).toEqual( {
			cardKeys: [ 'jetpack' ],
			overflowSlugs: [],
		} );
	} );

	test( 'pairs a per-plugin Jetpack card with another family card', () => {
		expect( getFeatureSelection( [ 'woocommerce', 'jetpack-boost' ] ) ).toEqual( {
			cardKeys: [ 'woo', 'jetpack-boost' ],
			overflowSlugs: [],
		} );
		expect( getFeatureSelection( [ 'automattic-for-agencies-client', 'jetpack-search' ] ) ).toEqual(
			{
				cardKeys: [ 'a4a', 'jetpack-search' ],
				overflowSlugs: [],
			}
		);
	} );

	test( 'preserves the input order when building the overflow list', () => {
		expect(
			getFeatureSelection( [
				'jetpack',
				'automattic-for-agencies-client',
				'woocommerce',
				'unknown-a',
				'unknown-b',
			] )
		).toEqual( {
			cardKeys: [ 'a4a', 'woo' ],
			overflowSlugs: [ 'jetpack', 'unknown-a', 'unknown-b' ],
		} );
	} );
} );
