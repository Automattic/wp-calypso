/**
 * @jest-environment jsdom
 */

import { getConnectorFeatureCards, getSecondaryAdminFeatureCards } from '../feature-cards';

describe( 'getSecondaryAdminFeatureCards', () => {
	test( 'returns a single-bullet Jetpack card when only jetpack is installed', () => {
		const { cards } = getSecondaryAdminFeatureCards( [ 'jetpack' ] );
		expect( cards ).toHaveLength( 1 );
		expect( cards[ 0 ].id ).toBe( 'jetpack' );
		expect( cards[ 0 ].title ).toBe( 'Jetpack' );
		expect( cards[ 0 ].bullets ).toHaveLength( 1 );
		expect( cards[ 0 ].bullets[ 0 ] ).toContain( 'activity log' );
		// SSO is intentionally not surfaced — only the full Jetpack plugin
		// ships it, but listing it on this card alone would break the
		// uniform single-bullet shape across the secondary card row.
		expect( cards[ 0 ].bullets.join( ' ' ) ).not.toContain( 'SSO' );
	} );

	test( 'returns a Woo card with management-voice bullet when only woocommerce is installed', () => {
		const { cards } = getSecondaryAdminFeatureCards( [ 'woocommerce' ] );
		expect( cards ).toHaveLength( 1 );
		expect( cards[ 0 ].id ).toBe( 'woo' );
		expect( cards[ 0 ].title ).toBe( 'WooCommerce' );
		expect( cards[ 0 ].bullets ).toHaveLength( 1 );
		expect( cards[ 0 ].bullets[ 0 ] ).toContain( 'manage this store' );
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
		expect( cards[ 0 ].bullets ).toHaveLength( 1 );
		// jetpack-backup keeps the backup-specific bullet — the duplicate
		// activity-log bullet was dropped to avoid overlap with the generic
		// Jetpack card.
		expect( cards[ 0 ].bullets[ 0 ] ).toContain( 'backup status' );
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

	describe( 'A4A-aware bullet slicing', () => {
		test( 'supporting cards keep the full bullet list when A4A is absent', () => {
			const { cards } = getConnectorFeatureCards( [ 'woocommerce', 'jetpack' ] );
			const woo = cards.find( ( c ) => c.id === 'woo' );
			const jetpack = cards.find( ( c ) => c.id === 'jetpack' );
			expect( woo?.bullets.length ).toBeGreaterThanOrEqual( 2 );
			expect( jetpack?.bullets.length ).toBeGreaterThanOrEqual( 2 );
		} );

		test( 'collapses supporting cards to a single bullet when A4A is present', () => {
			const { cards } = getConnectorFeatureCards( [
				'automattic-for-agencies-client',
				'woocommerce',
				'jetpack',
			] );
			const a4a = cards.find( ( c ) => c.id === 'a4a' );
			const woo = cards.find( ( c ) => c.id === 'woo' );
			const jetpack = cards.find( ( c ) => c.id === 'jetpack' );

			// A4A is the primary card and keeps its full agency-focused bullet list.
			expect( a4a?.bullets.length ).toBeGreaterThanOrEqual( 2 );
			// Supporting cards collapse to their audience-neutral lead bullet.
			expect( woo?.bullets ).toHaveLength( 1 );
			expect( jetpack?.bullets ).toHaveLength( 1 );
		} );

		test( 'slices per-plugin Jetpack cards (jetpack-social) when A4A is present', () => {
			const { cards } = getConnectorFeatureCards( [
				'automattic-for-agencies-client',
				'jetpack-social',
			] );
			const social = cards.find( ( c ) => c.id === 'jetpack-social' );
			expect( social?.bullets ).toHaveLength( 1 );
			// Confirm the rewritten lead bullet — makes clear the SITE does the
			// posting, addressing the reviewer's "on their behalf" concern.
			expect( social?.bullets[ 0 ] ).toContain( "site's connected social networks" );
		} );

		test( 'does not slice the A4A card itself', () => {
			const { cards } = getConnectorFeatureCards( [
				'automattic-for-agencies-client',
				'woocommerce',
			] );
			const a4a = cards.find( ( c ) => c.id === 'a4a' );
			expect( a4a?.bullets.length ).toBeGreaterThanOrEqual( 2 );
		} );
	} );

	describe( 'heroFirstCard hint', () => {
		test( 'is true when A4A is present alongside other plugins', () => {
			expect(
				getConnectorFeatureCards( [ 'automattic-for-agencies-client', 'woocommerce' ] )
					.heroFirstCard
			).toBe( true );
			expect(
				getConnectorFeatureCards( [ 'automattic-for-agencies-client', 'woocommerce', 'jetpack' ] )
					.heroFirstCard
			).toBe( true );
			expect(
				getConnectorFeatureCards( [ 'automattic-for-agencies-client', 'jetpack-social' ] )
					.heroFirstCard
			).toBe( true );
		} );

		test( 'is true even when A4A is the only active plugin', () => {
			// `heroFirstCard` is a presentation hint; the single-card layout
			// is unaffected by it, so the value just reflects "A4A is the
			// primary card".
			expect( getConnectorFeatureCards( [ 'automattic-for-agencies-client' ] ).heroFirstCard ).toBe(
				true
			);
		} );

		test( 'is false when no A4A plugin is present', () => {
			expect( getConnectorFeatureCards( [ 'woocommerce', 'jetpack' ] ).heroFirstCard ).toBe(
				false
			);
			expect( getConnectorFeatureCards( [ 'jetpack' ] ).heroFirstCard ).toBe( false );
			expect( getConnectorFeatureCards( [] ).heroFirstCard ).toBe( false );
		} );

		test( 'getSecondaryAdminFeatureCards mirrors the same A4A hint', () => {
			expect(
				getSecondaryAdminFeatureCards( [ 'automattic-for-agencies-client', 'jetpack' ] )
					.heroFirstCard
			).toBe( true );
			expect( getSecondaryAdminFeatureCards( [ 'jetpack' ] ).heroFirstCard ).toBe( false );
		} );
	} );
} );
