import { getSubtitleScenario } from '../scenarios';

describe( 'getSubtitleScenario', () => {
	describe( 'multi-family combinations', () => {
		test( 'A4A + Woo + Jetpack returns ALL_THREE regardless of slug order', () => {
			expect(
				getSubtitleScenario( [ 'jetpack', 'woocommerce', 'automattic-for-agencies-client' ] )
			).toBe( 'ALL_THREE' );
			expect(
				getSubtitleScenario( [ 'automattic-for-agencies-client', 'woocommerce', 'jetpack' ] )
			).toBe( 'ALL_THREE' );
		} );

		test( 'A4A + Woo (no Jetpack) returns A4A_WOO', () => {
			expect( getSubtitleScenario( [ 'automattic-for-agencies-client', 'woocommerce' ] ) ).toBe(
				'A4A_WOO'
			);
		} );

		test( 'A4A + Jetpack (no Woo) returns A4A_JETPACK', () => {
			expect( getSubtitleScenario( [ 'automattic-for-agencies-client', 'jetpack-boost' ] ) ).toBe(
				'A4A_JETPACK'
			);
		} );

		test( 'Woo + Jetpack (no A4A) returns WOO_JETPACK', () => {
			expect( getSubtitleScenario( [ 'woocommerce', 'jetpack' ] ) ).toBe( 'WOO_JETPACK' );
			expect( getSubtitleScenario( [ 'woocommerce-payments', 'jetpack-protect' ] ) ).toBe(
				'WOO_JETPACK'
			);
		} );
	} );

	describe( 'single-family — A4A', () => {
		test( 'returns A4A_ONLY for the agencies-client plugin', () => {
			expect( getSubtitleScenario( [ 'automattic-for-agencies-client' ] ) ).toBe( 'A4A_ONLY' );
		} );
	} );

	describe( 'single-family — Woo', () => {
		test( 'returns WOO_ONLY for woocommerce alone', () => {
			expect( getSubtitleScenario( [ 'woocommerce' ] ) ).toBe( 'WOO_ONLY' );
		} );

		test( 'returns WOO_AND_PAY when both core and payments are active', () => {
			expect( getSubtitleScenario( [ 'woocommerce', 'woocommerce-payments' ] ) ).toBe(
				'WOO_AND_PAY'
			);
			expect( getSubtitleScenario( [ 'woocommerce-payments', 'woocommerce' ] ) ).toBe(
				'WOO_AND_PAY'
			);
		} );

		test( 'an unknown Woo-prefixed slug routes to WOO_ONLY', () => {
			expect( getSubtitleScenario( [ 'woocommerce-marketing' ] ) ).toBe( 'WOO_ONLY' );
		} );

		test( 'a malformed woocommerce-payments-only list defensively routes to WOO_ONLY', () => {
			// WooPayments has a hard activation dependency on WooCommerce
			// core, so this combination cannot occur in practice. The
			// fall-through guarantees the flow still uses store-aware copy
			// if the plugin list ever arrives malformed.
			expect( getSubtitleScenario( [ 'woocommerce-payments' ] ) ).toBe( 'WOO_ONLY' );
		} );
	} );

	describe( 'single-family — Jetpack', () => {
		test( 'returns JETPACK_FULL when the full Jetpack plugin is present', () => {
			expect( getSubtitleScenario( [ 'jetpack' ] ) ).toBe( 'JETPACK_FULL' );
		} );

		test( 'full Jetpack wins even when individual plugins are also active', () => {
			expect( getSubtitleScenario( [ 'jetpack', 'jetpack-backup' ] ) ).toBe( 'JETPACK_FULL' );
			expect( getSubtitleScenario( [ 'jetpack-protect', 'jetpack' ] ) ).toBe( 'JETPACK_FULL' );
		} );

		test.each( [
			[ 'jetpack-backup', 'JETPACK_BACKUP' ],
			[ 'jetpack-protect', 'JETPACK_PROTECT' ],
			[ 'jetpack-boost', 'JETPACK_BOOST' ],
			[ 'jetpack-search', 'JETPACK_SEARCH' ],
			[ 'jetpack-social', 'JETPACK_SOCIAL' ],
			[ 'jetpack-videopress', 'JETPACK_VIDEOPRESS' ],
		] )( 'returns %s for the dedicated single-plugin slug', ( slug, expected ) => {
			expect( getSubtitleScenario( [ slug ] ) ).toBe( expected );
		} );

		test( 'returns JETPACK_MULTI when 2+ individual Jetpack plugins are active without the full plugin', () => {
			expect( getSubtitleScenario( [ 'jetpack-backup', 'jetpack-protect' ] ) ).toBe(
				'JETPACK_MULTI'
			);
			expect( getSubtitleScenario( [ 'jetpack-search', 'jetpack-social', 'jetpack-boost' ] ) ).toBe(
				'JETPACK_MULTI'
			);
		} );

		test( 'an unknown jetpack-prefixed individual slug routes to JETPACK_MULTI', () => {
			expect( getSubtitleScenario( [ 'jetpack-stats' ] ) ).toBe( 'JETPACK_MULTI' );
		} );
	} );

	describe( 'fallback', () => {
		test( 'returns OTHER_ONLY for an empty plugin list', () => {
			expect( getSubtitleScenario( [] ) ).toBe( 'OTHER_ONLY' );
			expect( getSubtitleScenario() ).toBe( 'OTHER_ONLY' );
		} );

		test( 'returns OTHER_ONLY when only unknown plugins are active', () => {
			expect( getSubtitleScenario( [ 'some-third-party-plugin' ] ) ).toBe( 'OTHER_ONLY' );
			expect( getSubtitleScenario( [ 'foo', 'bar', 'baz' ] ) ).toBe( 'OTHER_ONLY' );
		} );

		test( 'unknown plugins are silently ignored when a known family is also present', () => {
			expect( getSubtitleScenario( [ 'jetpack', 'unknown-plugin' ] ) ).toBe( 'JETPACK_FULL' );
			expect( getSubtitleScenario( [ 'woocommerce', 'unknown-plugin' ] ) ).toBe( 'WOO_ONLY' );
			expect(
				getSubtitleScenario( [
					'automattic-for-agencies-client',
					'woocommerce',
					'jetpack',
					'unknown-plugin',
				] )
			).toBe( 'ALL_THREE' );
		} );
	} );
} );
