/**
 * External dependencies
 */
import { useEffect, useRef } from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import {
	ResponseCart,
	RequestCart,
	convertRawResponseCartToResponseCart,
} from '../../types/backend/shopping-cart-endpoint';
import { CacheStatus, ShoppingCartAction } from './types';

const debug = debugFactory( 'calypso:composite-checkout:use-initialize-cart-from-server' );

export default function useInitializeCartFromServer(
	cacheStatus: CacheStatus,
	canInitializeCart: boolean,
	getCart: () => Promise< ResponseCart >,
	setCart: ( arg0: RequestCart ) => Promise< ResponseCart >,
	hookDispatch: ( arg0: ShoppingCartAction ) => void
): void {
	const isInitialized = useRef( false );

	useEffect( () => {
		if ( cacheStatus !== 'fresh' ) {
			debug( 'not initializing cart; cacheStatus is not fresh' );
			return;
		}
		if ( canInitializeCart !== true ) {
			debug( 'not initializing cart; canInitializeCart is not true' );
			return;
		}

		if ( isInitialized.current ) {
			debug( 'not initializing cart; already initialized' );
			return;
		}
		isInitialized.current = true;
		debug( `initializing the cart; cacheStatus is ${ cacheStatus }` );

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
