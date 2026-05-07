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

	test( 'lists every active slug in the Used-by row when more than one unknown plugin is connected', () => {
		expect( getFeatureSelection( [ 'unknown-plugin', 'another-unknown' ] ) ).toEqual( {
			cardKeys: [ 'other' ],
			overflowSlugs: [ 'unknown-plugin', 'another-unknown' ],
		} );
	} );

	test( 'features the highest-priority known family for single-plugin inputs and skips the Used-by row', () => {
		expect( getFeatureSelection( [ 'automattic-for-agencies-client' ] ) ).toEqual( {
			cardKeys: [ 'a4a' ],
			overflowSlugs: [],
		} );
	} );

	test( 'repeats the visible plugins in the Used-by row whenever more than one is connected', () => {
		// Same family → one card, two plugin names in Used-by so users can
		// tell which Woo plugins are part of the connection.
		expect( getFeatureSelection( [ 'woocommerce', 'woocommerce-payments' ] ) ).toEqual( {
			cardKeys: [ 'woo' ],
			overflowSlugs: [ 'woocommerce', 'woocommerce-payments' ],
		} );

		// Two different families → two cards, two plugin names. The
		// redundancy is deliberate: titles are removed from cards, so the
		// row is the only place the brand-shared Jetpack card gets a name.
		expect( getFeatureSelection( [ 'woocommerce', 'jetpack' ] ) ).toEqual( {
			cardKeys: [ 'woo', 'jetpack' ],
			overflowSlugs: [ 'woocommerce', 'jetpack' ],
		} );
	} );

	test( 'features all three known families when present and lists every active slug in the Used-by row', () => {
		// Default max is 3: A4A on top (full-width in the layout), Woo and
		// Jetpack share the row below. Used-by still repeats every active
		// plugin (including the visible three) so individual Jetpack
		// plugins are named even though every Jetpack-family card shares
		// the same brand mark.
		expect(
			getFeatureSelection( [ 'automattic-for-agencies-client', 'woocommerce', 'jetpack' ] )
		).toEqual( {
			cardKeys: [ 'a4a', 'woo', 'jetpack' ],
			overflowSlugs: [ 'automattic-for-agencies-client', 'woocommerce', 'jetpack' ],
		} );
	} );

	test( 'collapses multiple individual Jetpack plugins into the generic Jetpack card and lists each slug', () => {
		expect(
			getFeatureSelection( [
				'automattic-for-agencies-client',
				'woocommerce',
				'jetpack-boost',
				'jetpack-search',
			] )
		).toEqual( {
			cardKeys: [ 'a4a', 'woo', 'jetpack' ],
			overflowSlugs: [
				'automattic-for-agencies-client',
				'woocommerce',
				'jetpack-boost',
				'jetpack-search',
			],
		} );
	} );

	test( 'respects the max argument', () => {
		// Capping at 2 falls back to the previous "feature the top two
		// families and list every active slug" behaviour, keeping Jetpack
		// in the Used-by row because Jetpack is no longer featured.
		expect(
			getFeatureSelection( [ 'automattic-for-agencies-client', 'woocommerce', 'jetpack' ], 2 )
		).toEqual( {
			cardKeys: [ 'a4a', 'woo' ],
			overflowSlugs: [ 'automattic-for-agencies-client', 'woocommerce', 'jetpack' ],
		} );
		expect( getFeatureSelection( [ 'automattic-for-agencies-client', 'woocommerce' ], 1 ) ).toEqual(
			{
				cardKeys: [ 'a4a' ],
				overflowSlugs: [ 'automattic-for-agencies-client', 'woocommerce' ],
			}
		);
	} );

	test( 'lists unknown-family slugs in the Used-by row alongside the featured plugins', () => {
		expect( getFeatureSelection( [ 'jetpack', 'unknown-plugin' ] ) ).toEqual( {
			cardKeys: [ 'jetpack' ],
			overflowSlugs: [ 'jetpack', 'unknown-plugin' ],
		} );
	} );

	test( 'collapses to the generic Jetpack card when the full Jetpack plugin is present', () => {
		expect( getFeatureSelection( [ 'jetpack' ] ) ).toEqual( {
			cardKeys: [ 'jetpack' ],
			overflowSlugs: [],
		} );
		expect( getFeatureSelection( [ 'jetpack', 'jetpack-boost' ] ) ).toEqual( {
			cardKeys: [ 'jetpack' ],
			overflowSlugs: [ 'jetpack', 'jetpack-boost' ],
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

	test( 'collapses to the generic Jetpack card for two-or-more individual Jetpack plugins and lists each slug', () => {
		expect( getFeatureSelection( [ 'jetpack-backup', 'jetpack-boost' ] ) ).toEqual( {
			cardKeys: [ 'jetpack' ],
			overflowSlugs: [ 'jetpack-backup', 'jetpack-boost' ],
		} );
	} );

	test( 'pairs a per-plugin Jetpack card with another family card and still names both slugs', () => {
		expect( getFeatureSelection( [ 'woocommerce', 'jetpack-boost' ] ) ).toEqual( {
			cardKeys: [ 'woo', 'jetpack-boost' ],
			overflowSlugs: [ 'woocommerce', 'jetpack-boost' ],
		} );
		expect( getFeatureSelection( [ 'automattic-for-agencies-client', 'jetpack-search' ] ) ).toEqual(
			{
				cardKeys: [ 'a4a', 'jetpack-search' ],
				overflowSlugs: [ 'automattic-for-agencies-client', 'jetpack-search' ],
			}
		);
	} );

	test( 'preserves the input order when building the Used-by list', () => {
		expect(
			getFeatureSelection( [
				'jetpack',
				'automattic-for-agencies-client',
				'woocommerce',
				'unknown-a',
				'unknown-b',
			] )
		).toEqual( {
			cardKeys: [ 'a4a', 'woo', 'jetpack' ],
			overflowSlugs: [
				'jetpack',
				'automattic-for-agencies-client',
				'woocommerce',
				'unknown-a',
				'unknown-b',
			],
		} );
	} );
} );
