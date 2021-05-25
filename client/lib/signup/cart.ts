/**
 * External dependencies
 */
import type { ResponseCart, RequestCart, RequestCartProduct } from '@automattic/shopping-cart';
import { getEmptyResponseCart, convertResponseCartToRequestCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import productsListFactory from 'calypso/lib/products-list';
const productsList = productsListFactory();
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';

function addProductsToCart( cart: ResponseCart, newCartItems: RequestCartProduct[] ): RequestCart {
	const productsData = productsList.get();
	const newProducts = newCartItems.map( function ( cartItem ) {
		cartItem.extra = { ...cartItem.extra, context: 'signup' };
		return fillInSingleCartItemAttributes( cartItem, productsData );
	} );
	return convertResponseCartToRequestCart( {
		...cart,
		products: [ ...cart.products, ...newProducts ],
	} );
}

export type ErrorCallback = ( error: unknown ) => void;

export default {
	createCart: function (
		cartKey: string,
		newCartItems: RequestCartProduct[],
		callback: ErrorCallback
	): void {
		const newCart = {
			...getEmptyResponseCart(),
			cart_key: cartKey,
		};

		const updatedCart = addProductsToCart( newCart, newCartItems );

		wpcom.undocumented().setCart( cartKey, updatedCart, function ( postError: unknown ) {
			callback( postError );
		} );
	},
	addToCart: function (
		cartKey: string,
		newCartItems: RequestCartProduct[],
		callback: ErrorCallback
	): void {
		wpcom.undocumented().getCart( cartKey, function ( error: unknown, data: ResponseCart ) {
			if ( error ) {
				return callback( error );
			}

			if ( ! Array.isArray( newCartItems ) ) {
				newCartItems = [ newCartItems ];
			}

			const newCart = addProductsToCart( data, newCartItems );

			wpcom.undocumented().setCart( cartKey, newCart, callback );
		} );
	},
};
