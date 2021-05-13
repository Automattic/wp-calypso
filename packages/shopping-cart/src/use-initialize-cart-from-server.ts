/**
 * External dependencies
 */
import { useEffect, useRef } from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { convertRawResponseCartToResponseCart } from './cart-functions';
import type { ResponseCart, RequestCart, CacheStatus, ShoppingCartAction } from './types';

const debug = debugFactory( 'shopping-cart:use-initialize-cart-from-server' );

export default function useInitializeCartFromServer(
	cacheStatus: CacheStatus,
	cartKey: string | number | null | undefined,
	getCart: () => Promise< ResponseCart >,
	setCart: ( arg0: RequestCart ) => Promise< ResponseCart >,
	hookDispatch: ( arg0: ShoppingCartAction ) => void
): void {
	const isMounted = useRef< boolean >( true );
	useEffect( () => {
		return () => {
			isMounted.current = false;
		};
	}, [] );

	useEffect( () => {
		if ( cacheStatus !== 'fresh' ) {
			debug( 'not initializing cart; cacheStatus is not fresh' );
			return;
		}
		if ( ! cartKey ) {
			debug( 'not initializing cart; no cartKey set' );
			return;
		}

		debug( `cart key is "${ cartKey }"; initializing cart` );
		hookDispatch( { type: 'FETCH_INITIAL_RESPONSE_CART' } );

		getCart()
			.then( ( response ) => {
				debug( 'initialized cart is', response );
				const initialResponseCart = convertRawResponseCartToResponseCart( response );
				isMounted.current &&
					hookDispatch( {
						type: 'RECEIVE_INITIAL_RESPONSE_CART',
						initialResponseCart,
					} );
			} )
			.catch( ( error ) => {
				debug( 'error while initializing cart', error );
				isMounted.current &&
					hookDispatch( {
						type: 'RAISE_ERROR',
						error: 'GET_SERVER_CART_ERROR',
						message: error.message,
					} );
			} );
	}, [ isMounted, cacheStatus, cartKey, hookDispatch, getCart, setCart ] );
}
