import { recordAddToCart } from 'calypso/lib/analytics/record-add-to-cart';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

export type MinimalRequestCartProductWithoutExtra = Omit< MinimalRequestCartProduct, 'extra' >;

function removeNestedProperties(
	cartItem: MinimalRequestCartProduct
): MinimalRequestCartProductWithoutExtra {
	const { extra, ...newItem } = cartItem;
	return newItem;
}

export function recordAddEvent( cartItem: MinimalRequestCartProduct ): void {
	recordTracksEvent( 'calypso_cart_product_add', removeNestedProperties( cartItem ) );
	recordAddToCart( { cartItem } );
}
