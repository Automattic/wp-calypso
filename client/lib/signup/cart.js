/** @format */

/**
 * External dependencies
 */

import { forEach } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import productsListFactory from 'lib/products-list';
const productsList = productsListFactory();
import { cartItems, fillInAllCartItemAttributes } from 'lib/cart-values';

function addProductsToCart( cart, newCartItems ) {
	forEach( newCartItems, function( cartItem ) {
		cartItem.extra = Object.assign( cartItem.extra || {}, {
			context: 'signup',
		} );
		const addFunction = cartItems.add( cartItem );

		cart = fillInAllCartItemAttributes( addFunction( cart ), productsList.get() );
	} );

	return cart;
}

export default {
	createCart: function( cartKey, newCartItems, callback ) {
		let newCart = {
			cart_key: cartKey,
			products: [],
			temporary: false,
		};

		newCart = addProductsToCart( newCart, newCartItems );

		wpcom.undocumented().cart( cartKey, 'POST', newCart, function( postError ) {
			callback( postError );
		} );
	},
	addToCart: function( cartKey, newCartItems, callback ) {
		wpcom.undocumented().cart( cartKey, function( error, data ) {
			if ( error ) {
				return callback( error );
			}

			if ( ! Array.isArray( newCartItems ) ) {
				newCartItems = [ newCartItems ];
			}

			const newCart = addProductsToCart( data, newCartItems );

			wpcom.undocumented().cart( cartKey, 'POST', newCart, callback );
		} );
	},
};
