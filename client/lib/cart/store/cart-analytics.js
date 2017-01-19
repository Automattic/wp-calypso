/**
 * Internal dependencies
 */
var analytics = require( 'lib/analytics' ),
	cartItems = require( 'lib/cart-values' ).cartItems,
	difference = require( 'lodash/difference' );

import { recordAddToCart } from 'lib/analytics/ad-tracking';

function recordEvents( previousCart, nextCart ) {
	var previousItems = cartItems.getAll( previousCart ),
		nextItems = cartItems.getAll( nextCart );

	difference( nextItems, previousItems ).forEach( recordAddEvent );
	difference( previousItems, nextItems ).forEach( recordRemoveEvent );
}

function recordAddEvent( cartItem ) {
	analytics.tracks.recordEvent( 'calypso_cart_product_add', cartItem );
	analytics.ga.recordEvent( 'Checkout', 'calypso_cart_product_add',
		`${ cartItem.product_id } ${ cartItem.product_slug }` );
	recordAddToCart( cartItem );
}

function recordRemoveEvent( cartItem ) {
	analytics.tracks.recordEvent( 'calypso_cart_product_remove', cartItem );
}

module.exports = {
	recordEvents: recordEvents
};
