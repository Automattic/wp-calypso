/**
 * External dependencies
 */
import { difference, each, omit } from 'lodash';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { cartItems } from 'lib/cart-values';
import { recordAddToCart } from 'lib/analytics/ad-tracking';

function recordEvents( previousCart, nextCart ) {
	const previousItems = cartItems.getAll( previousCart ),
		nextItems = cartItems.getAll( nextCart );

	each( difference( nextItems, previousItems ), recordAddEvent );
	each( difference( previousItems, nextItems ), recordRemoveEvent );
}

function removeNestedProperties( cartItem ) {
	return omit( cartItem, [ 'extra' ] );
}

function recordAddEvent( cartItem ) {
	analytics.tracks.recordEvent( 'calypso_cart_product_add', removeNestedProperties( cartItem ) );
	recordAddToCart( cartItem );
}

function recordRemoveEvent( cartItem ) {
	analytics.tracks.recordEvent( 'calypso_cart_product_remove', removeNestedProperties( cartItem ) );
}

export default {
	recordEvents,
	removeNestedProperties
};
