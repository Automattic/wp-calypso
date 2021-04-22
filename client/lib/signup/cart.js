/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import productsListFactory from 'calypso/lib/products-list';
const productsList = productsListFactory();
import { preprocessCartForServer, fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';

function addProductsToCart( cart, newCartItems ) {
	const productsData = productsList.get();
	const newProducts = newCartItems.map( function ( cartItem ) {
		cartItem.extra = { ...cartItem.extra, context: 'signup' };
		return fillInSingleCartItemAttributes( cartItem, productsData );
	} );
	return {
		...cart,
		products: [ ...cart.products, newProducts ],
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
	addToCart: function ( cartKey, newCartItems, callback ) {
		wpcom.undocumented().getCart( cartKey, function ( error, data ) {
			if ( error ) {
				return callback( error );
			}

			if ( ! Array.isArray( newCartItems ) ) {
				newCartItems = [ newCartItems ];
			}

			let newCart = addProductsToCart( data, newCartItems );
			newCart = preprocessCartForServer( newCart );

			wpcom.undocumented().setCart( cartKey, newCart, callback );
		} );
	},
};
