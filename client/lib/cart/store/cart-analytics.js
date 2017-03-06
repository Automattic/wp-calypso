/**
 * External dependencies
 */
import { difference, each, isObjectLike, omitBy } from 'lodash';

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

function flattenCartObject( cartItem ) {
	return omitBy( cartItem, isObjectLike );
}

function recordAddEvent( cartItem ) {
	analytics.tracks.recordEvent( 'calypso_cart_product_add', flattenCartObject( cartItem ) );
	recordAddToCart( cartItem );
}

function recordRemoveEvent( cartItem ) {
	analytics.tracks.recordEvent( 'calypso_cart_product_remove', flattenCartObject( cartItem ) );
}

export default {
	recordEvents: recordEvents
};
