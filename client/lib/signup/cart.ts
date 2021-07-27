/**
 * External dependencies
 */
import type { ResponseCart, RequestCart, RequestCartProduct } from '@automattic/shopping-cart';
import {
	getEmptyResponseCart,
	convertResponseCartToRequestCart,
	createRequestCartProduct,
} from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';
import productsListFactory from 'calypso/lib/products-list';
const productsList = productsListFactory();
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';

const wpcomGetCart = ( cartKey: string ) => wp.req.get( `/me/shopping-cart/${ cartKey }` );
const wpcomSetCart = ( cartKey: string, cartData: RequestCart ) =>
	wp.req.post( `/me/shopping-cart/${ cartKey }`, cartData );

function addProductsToCart( cart: ResponseCart, newCartItems: RequestCartProduct[] ): RequestCart {
	const productsData = productsList.get();
	const newProducts = newCartItems
		.map( function ( cartItem ) {
			cartItem.extra = { ...cartItem.extra, context: 'signup' };
			return fillInSingleCartItemAttributes( cartItem, productsData );
		} )
		.map( createRequestCartProduct );
	return convertResponseCartToRequestCart( {
		...cart,
		products: [ ...cart.products, ...newProducts ],
	} );
}

export type CartOperationCallback = ( error: unknown, data?: unknown ) => void;

export function createCart(
	cartKey: string,
	newCartItems: RequestCartProduct[],
	callback: CartOperationCallback
): void {
	const newCart = {
		...getEmptyResponseCart(),
		cart_key: cartKey,
	};

	const updatedCart = addProductsToCart( newCart, newCartItems );

	wpcomSetCart( cartKey, updatedCart )
		.then( ( result: unknown ) => callback( undefined, result ) )
		.catch( ( error: unknown ) => callback( error ) );
}

export function addToCart(
	cartKey: string,
	newCartItems: RequestCartProduct[],
	callback: CartOperationCallback
): void {
	wpcomGetCart( cartKey )
		.then( ( data: ResponseCart ) => {
			if ( ! Array.isArray( newCartItems ) ) {
				newCartItems = [ newCartItems ];
			}

			const newCart = addProductsToCart( data, newCartItems );

			return wpcomSetCart( cartKey, newCart );
		} )
		.then( ( result: unknown ) => callback( undefined, result ) )
		.catch( ( error: unknown ) => callback( error ) );
}
