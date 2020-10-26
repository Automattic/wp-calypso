/**
 * External dependencies
 */
import { useEffect, useRef } from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { convertRawResponseCartToResponseCart } from './cart-functions';
import { ResponseCart, RequestCart, CacheStatus, ShoppingCartAction } from './types';

const debug = debugFactory( 'shopping-cart:use-initialize-cart-from-server' );

export default function useInitializeCartFromServer(
	cacheStatus: CacheStatus,
	cartKey: string | number | null | undefined,
	getCart: () => Promise< ResponseCart >,
	setCart: ( arg0: RequestCart ) => Promise< ResponseCart >,
	hookDispatch: ( arg0: ShoppingCartAction ) => void
): void {
	const previousCartKey = useRef< string | number | undefined >();
	useEffect( () => {
		if ( cacheStatus !== 'fresh' ) {
			debug( 'not initializing cart; cacheStatus is not fresh' );
			return;
		}
		if ( ! cartKey ) {
			debug( 'not initializing cart; no cartKey set' );
			return;
		}
		if ( cartKey === previousCartKey.current ) {
			debug( 'not initializing cart; cartKey has not changed' );
			return;
		}

		debug(
			`cart key "${ cartKey }" has changed from "${ previousCartKey.current }"; initializing cart`
		);
		previousCartKey.current = cartKey;
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
	}, [ cacheStatus, cartKey, hookDispatch, getCart, setCart ] );
}
