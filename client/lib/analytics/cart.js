/**
 * External dependencies
 */
import { differenceWith, isEqual, each, omit } from 'lodash';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { recordAddToCart } from 'calypso/lib/analytics/record-add-to-cart';
import { getAllCartItems } from 'calypso/lib/cart-values/cart-items';

export function recordEvents( previousCart, nextCart ) {
	const previousItems = getAllCartItems( previousCart );
	const nextItems = getAllCartItems( nextCart );

	each( differenceWith( nextItems, previousItems, isEqual ), recordAddEvent );
	each( differenceWith( previousItems, nextItems, isEqual ), recordRemoveEvent );
}

function removeNestedProperties( cartItem ) {
	return omit( cartItem, [ 'extra' ] );
}

export function recordAddEvent( cartItem ) {
	recordTracksEvent( 'calypso_cart_product_add', removeNestedProperties( cartItem ) );
	recordAddToCart( { cartItem } );
}

function recordRemoveEvent( cartItem ) {
	recordTracksEvent( 'calypso_cart_product_remove', removeNestedProperties( cartItem ) );
}
