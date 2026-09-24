import getPurchasedWPCOMPlanSlug from '../get-purchased-wpcom-plan-slug';
import type { ShoppingCartItem } from '../../../types';

const cartItem = ( slug: string ) => ( { slug } ) as ShoppingCartItem;

describe( 'getPurchasedWPCOMPlanSlug', () => {
	it( 'returns the slug of the purchased WordPress.com plan', () => {
		expect( getPurchasedWPCOMPlanSlug( [ cartItem( 'wpcom-hosting-business' ) ] ) ).toBe(
			'wpcom-hosting-business'
		);
	} );

	it( 'matches a WordPress.com plan alongside other products, as the legacy flow did', () => {
		expect(
			getPurchasedWPCOMPlanSlug( [
				cartItem( 'jetpack-backup' ),
				cartItem( 'wpcom-hosting-business' ),
			] )
		).toBe( 'wpcom-hosting-business' );
	} );

	it( 'returns null when no WordPress.com plan is in the cart', () => {
		expect(
			getPurchasedWPCOMPlanSlug( [ cartItem( 'jetpack-backup' ), cartItem( 'pressable-build' ) ] )
		).toBeNull();
	} );

	it( 'returns null for an empty cart', () => {
		expect( getPurchasedWPCOMPlanSlug( [] ) ).toBeNull();
	} );
} );
