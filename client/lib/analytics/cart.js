/**
 * External dependencies
 */
import { differenceWith, get, isEqual, each, omit } from 'lodash';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'lib/analytics/tracks';
import { recordAddToCart } from 'lib/analytics/record-add-to-cart';
import { getAllCartItems } from 'lib/cart-values/cart-items';

export function recordEvents( previousCart, nextCart ) {
	const previousItems = getAllCartItems( previousCart );
	const nextItems = getAllCartItems( nextCart );

	each( differenceWith( nextItems, previousItems, isEqual ), recordAddEvent );
	each( differenceWith( previousItems, nextItems, isEqual ), recordRemoveEvent );
}

function removeNestedProperties( cartItem ) {
	return omit( cartItem, [ 'extra' ] );
}

function recordAddEvent( cartItem ) {
	recordTracksEvent( 'calypso_cart_product_add', removeNestedProperties( cartItem ) );
	recordAddToCart( { cartItem } );
}

function recordRemoveEvent( cartItem ) {
	recordTracksEvent( 'calypso_cart_product_remove', removeNestedProperties( cartItem ) );
}

export function recordUnrecognizedPaymentMethod( action ) {
	const payment = get( action, 'payment' );

	const eventArgs = {
		payment_method: get( payment, 'paymentMethod', 'missing' ),
		extra: JSON.stringify( payment ? omit( payment, 'paymentMethod' ) : action ),
	};

	recordTracksEvent( 'calypso_cart_unrecognized_payment_method', eventArgs );
}
