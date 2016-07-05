/**
 * External dependencies
 */
var forEach = require( 'lodash/forEach' );

/**
 * Internal dependencies
 */
var wpcom = require( 'lib/wp' ),
	productsList = require( 'lib/products-list' )(),
	cartValues = require( 'lib/cart-values' ),
	cartItems = cartValues.cartItems;

module.exports = {
	addToCart: function( siteSlug, newCartItems, callback ) {
		wpcom.undocumented().cart( siteSlug, function( error, data ) {
			if ( error ) {
				return callback( error );
			}

			if ( ! Array.isArray( newCartItems ) ) {
				newCartItems = [ newCartItems ];
			}

			let newCart = data;

			forEach( newCartItems, function( cartItem ) {
				cartItem.extra = Object.assign( cartItem.extra || {}, {
					context: 'signup'
				} );
				const addFunction = cartItems.add( cartItem );

				newCart = cartValues.fillInAllCartItemAttributes( addFunction( newCart ), productsList.get() );
			} );

			wpcom.undocumented().cart( siteSlug, 'POST', newCart, function( postError ) {
				callback( postError );
			} );
		} );
	}
};
