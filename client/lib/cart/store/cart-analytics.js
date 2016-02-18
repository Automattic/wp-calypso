/**
 * Internal dependencies
 */
var analytics = require( 'analytics' ),
	cartItems = require( 'lib/cart-values' ).cartItems,
	difference = require( 'lodash/difference' );

function recordEvents( previousCart, nextCart ) {
	var previousItems = cartItems.getAll( previousCart ),
		nextItems = cartItems.getAll( nextCart );

	difference( nextItems, previousItems ).forEach( recordAddEvent );
	difference( previousItems, nextItems ).forEach( recordRemoveEvent );
}

function recordAddEvent( cartItem ) {
	analytics.tracks.recordEvent( 'calypso_cart_product_add', cartItem );
}

function recordRemoveEvent( cartItem ) {
	analytics.tracks.recordEvent( 'calypso_cart_product_remove', cartItem );
}

module.exports = {
	recordEvents: recordEvents
};
