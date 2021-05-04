/**
 * External dependencies
 */
import { isEqual, each, omit } from 'lodash';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { recordAddToCart } from 'calypso/lib/analytics/record-add-to-cart';
import { getAllCartItems } from 'calypso/lib/cart-values/cart-items';

function difference( items1, items2 ) {
	return items1.filter( ( a ) => ! items2.some( ( b ) => isEqual( a, b ) ) );
}

export function recordEvents( previousCart, nextCart ) {
	const previousItems = getAllCartItems( previousCart );
	const nextItems = getAllCartItems( nextCart );

	each( difference( nextItems, previousItems ), recordAddEvent );
	each( difference( previousItems, nextItems ), recordRemoveEvent );
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
