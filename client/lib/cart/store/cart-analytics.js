/** @format */

/**
 * External dependencies
 */

import { differenceWith, get, isEqual, each, omit } from 'lodash';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { getAll as getAllCartItems } from 'lib/cart-values/cart-items';

export function recordEvents( previousCart, nextCart ) {
	const previousItems = getAllCartItems( previousCart ),
		nextItems = getAllCartItems( nextCart );

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
	const payment = get( action, 'payment' );

	const eventArgs = {
		payment_method: get( payment, 'paymentMethod', 'missing' ),
		extra: JSON.stringify( payment ? omit( payment, 'paymentMethod' ) : action ),
	};

	analytics.tracks.recordEvent( 'calypso_cart_unrecognized_payment_method', eventArgs );
}
