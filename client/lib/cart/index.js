/**
 * External dependencies
 */
var assign = require( 'lodash/assign' ),
	i18n = require( 'lib/mixins/i18n' ),
	pick = require( 'lodash/pick' ),
	omit = require( 'lodash/omit' );

var wpcom = require( 'lib/wp' ).undocumented(),
	cartValues = require( 'lib/cart-values' ),
	productsList = require( 'lib/products-list' )();

function preprocessCartFromServer( cart ) {
	var newCart = assign( {}, cart, {
		client_metadata: createClientMetadata(),
		products: castProductIDsToNumbers( cart.products )
	} );

	// Get rid of `_headers` data from `wpcom.js` until we actually need to use
	// it.
	newCart = omit( newCart, '_headers' );

	return newCart;
}

// Add a server response date so we can distinguish between carts with the
// same attributes from the server.
//
// NOTE: This object has underscored keys to match the rest of the attributes
//   in the `CartValue object`.
function createClientMetadata() {
	return { last_server_response_date: i18n.moment().toISOString() };
}

// FIXME: Temporary fix to cast string product IDs to numbers. There is a bug
//   with the API where it sometimes returns product IDs as strings.
function castProductIDsToNumbers( cartItems ) {
	return cartItems.map( function( item ) {
		return assign( {}, item, { product_id: parseInt( item.product_id, 10 ) } );
	} );
}

function preprocessCartForServer( cart ) {
	var newCartItems, newCart;

	newCart = pick( cart, 'products', 'coupon', 'is_coupon_applied', 'currency', 'temporary', 'extra' );

	newCartItems = cart.products.map( function( cartItem ) {
		return pick( cartItem, 'product_id', 'meta', 'free_trial', 'volume', 'extra' );
	} );
	newCart = assign( {}, newCart, { products: newCartItems } );

	return newCart;
}

export function fillInAllCartItemAttributes( cart ) {
	return cartValues.fillInAllCartItemAttributes( cart, productsList.get() );
}

export function updateCart( cart, callback ) {
	wpcom.cart( cart.blog_id, 'POST', preprocessCartForServer( cart ), function( error, newValue ) {
		if ( error ) {
			callback( error );
			return;
		}

		callback( null, preprocessCartFromServer( newValue ) );
	} );
}

export function getSavedCart( siteID, callback ) {
	wpcom.cart( siteID, 'GET', function( error, newValue ) {
		if ( error ) {
			callback( error );
			return;
		}

		callback( null, preprocessCartFromServer( newValue ) );
	} );
}
