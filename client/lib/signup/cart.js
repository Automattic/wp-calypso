/**
 * External dependencies
 */
import { forEach, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import productsListFactory from 'lib/products-list';
const productsList = productsListFactory();
import { preprocessCartForServer, fillInAllCartItemAttributes } from 'lib/cart-values';
import { isDomainRegistration } from 'lib/products-values';
import { addCartItem } from 'lib/cart-values/cart-items';

function addProductsToCart( cart, newCartItems ) {
	forEach( newCartItems, function ( cartItem ) {
		cartItem.extra = Object.assign( cartItem.extra || {}, {
			context: 'signup',
		} );
		const addFunction = addCartItem( cartItem );

		if ( isDomainRegistration( cartItem ) ) {
			cart.products = cart.products.filter( ( item ) => ! isDomainRegistration( item ) );
		}
		cart = fillInAllCartItemAttributes( addFunction( cart ), productsList.get() );
	} );

	return cart;
}

function addNewCartData( cart, newCartData ) {
	return {
		...cart,
		...( ! isEmpty( newCartData.createNewSiteData ) && {
			new_site_data: newCartData.createNewSiteData,
		} ),
	};
}

export default {
	createCart: function ( cartKey, newCartItems, callback ) {
		let newCart = {
			cart_key: cartKey,
			products: [],
			temporary: false,
		};

		newCart = addProductsToCart( newCart, newCartItems );
		newCart = preprocessCartForServer( newCart );

		wpcom.undocumented().setCart( cartKey, newCart, function ( postError ) {
			callback( postError );
		} );
	},
	addToCart: function ( cartKey, newCartItems, newCartData, callback ) {
		wpcom.undocumented().getCart( cartKey, function ( error, data ) {
			if ( error ) {
				return callback( error );
			}

			if ( ! Array.isArray( newCartItems ) ) {
				newCartItems = [ newCartItems ];
			}

			let newCart = addProductsToCart( data, newCartItems );
			newCart = addNewCartData( newCart, newCartData );
			newCart = preprocessCartForServer( newCart );

			wpcom.undocumented().setCart( cartKey, newCart, callback );
		} );
	},
};
