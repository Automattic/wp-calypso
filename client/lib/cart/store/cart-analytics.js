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

function recordAddEvent( cartItem ) {
	analytics.tracks.recordEvent( 'calypso_cart_product_add', omitBy( cartItem, isObjectLike ) );
	recordAddToCart( cartItem );
}

function recordRemoveEvent( cartItem ) {
	analytics.tracks.recordEvent( 'calypso_cart_product_remove', omitBy( cartItem, isObjectLike ) );
}

export default {
	recordEvents: recordEvents
};
