/** @format */

/**
 * External dependencies
 */

import { differenceWith, get, isEqual, each, omit } from 'lodash';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { cartItems } from 'lib/cart-values';

export function recordEvents( previousCart, nextCart ) {
	const previousItems = cartItems.getAll( previousCart ),
		nextItems = cartItems.getAll( nextCart );

	each( differenceWith( nextItems, previousItems, isEqual ), recordAddEvent );
	each( differenceWith( previousItems, nextItems, isEqual ), recordRemoveEvent );
}

export function removeNestedProperties( cartItem ) {
	return omit( cartItem, [ 'extra' ] );
}

function recordAddEvent( cartItem ) {
	analytics.tracks.recordEvent( 'calypso_cart_product_add', removeNestedProperties( cartItem ) );
	analytics.recordAddToCart( { cartItem } );
}

function recordRemoveEvent( cartItem ) {
	analytics.tracks.recordEvent( 'calypso_cart_product_remove', removeNestedProperties( cartItem ) );
}

export function recordUnrecognizedPaymentMethod( action ) {
	analytics.tracks.recordEvent( 'calypso_cart_unrecognized_payment_method', {
		payment: JSON.stringify( get( action, 'payment', action ) ),
	} );
}
