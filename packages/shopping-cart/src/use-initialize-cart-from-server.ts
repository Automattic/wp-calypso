/**
 * External dependencies
 */
import { useEffect } from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { convertRawResponseCartToResponseCart } from './cart-functions';
import { ResponseCart, RequestCart, CacheStatus, ShoppingCartAction } from './types';

const debug = debugFactory( 'shopping-cart:use-initialize-cart-from-server' );

export default function useInitializeCartFromServer(
	cacheStatus: CacheStatus,
	canInitializeCart: boolean,
	getCart: () => Promise< ResponseCart >,
	setCart: ( arg0: RequestCart ) => Promise< ResponseCart >,
	hookDispatch: ( arg0: ShoppingCartAction ) => void
): void {
	useEffect( () => {
		if ( cacheStatus !== 'fresh' ) {
			debug( 'not initializing cart; cacheStatus is not fresh' );
			return;
		}
		if ( canInitializeCart !== true ) {
			debug( 'not initializing cart; canInitializeCart is not true' );
			return;
		}
		debug( `initializing the cart; cacheStatus is ${ cacheStatus }` );
		hookDispatch( { type: 'FETCH_INITIAL_RESPONSE_CART' } );

		getCart()
			.then( ( response ) => {
				debug( 'initialized cart is', response );
				const initialResponseCart = convertRawResponseCartToResponseCart( response );
				hookDispatch( {
					type: 'RECEIVE_INITIAL_RESPONSE_CART',
					initialResponseCart,
				} );
			} )
			.catch( ( error ) => {
				debug( 'error while initializing cart', error );
				hookDispatch( {
					type: 'RAISE_ERROR',
					error: 'GET_SERVER_CART_ERROR',
					message: error.message,
				} );
			} );
	}, [ cacheStatus, canInitializeCart, hookDispatch, getCart, setCart ] );
}
