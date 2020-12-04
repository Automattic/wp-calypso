/**
 * External dependencies
 */
import { useEffect, useRef } from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import {
	convertResponseCartToRequestCart,
	convertRawResponseCartToResponseCart,
} from './cart-functions';
import type {
	TempResponseCart,
	RequestCart,
	ResponseCart,
	CacheStatus,
	ShoppingCartAction,
} from './types';

const debug = debugFactory( 'shopping-cart:use-cart-update-and-revalidate' );

export default function useCartUpdateAndRevalidate(
	cacheStatus: CacheStatus,
	responseCart: TempResponseCart,
	setServerCart: ( arg0: RequestCart ) => Promise< ResponseCart >,
	hookDispatch: ( arg0: ShoppingCartAction ) => void
): void {
	const pendingResponseCart = useRef< TempResponseCart >( responseCart );

	useEffect( () => {
		if ( cacheStatus !== 'invalid' ) {
			return;
		}

		if ( pendingResponseCart.current !== responseCart ) {
			debug( 'a request is still pending; cancelling that request for a new one' );
		}
		pendingResponseCart.current = responseCart;

		const requestCart = convertResponseCartToRequestCart( responseCart );
		debug( 'sending edited cart to server', requestCart );

		hookDispatch( { type: 'REQUEST_UPDATED_RESPONSE_CART' } );

		// We need to add is_update so that we don't add a plan automatically when the cart gets updated (DWPO).
		setServerCart( { ...requestCart, is_update: true } )
			.then( ( response ) => {
				debug( 'update cart request complete', requestCart, '; updated cart is', response );
				if ( responseCart !== pendingResponseCart.current ) {
					debug( 'ignoring updated cart because there is a newer request pending' );
					return;
				}
				hookDispatch( {
					type: 'RECEIVE_UPDATED_RESPONSE_CART',
					updatedResponseCart: convertRawResponseCartToResponseCart( response ),
				} );
			} )
			.catch( ( error ) => {
				debug( 'error while setting cart', error );
				hookDispatch( {
					type: 'RAISE_ERROR',
					error: 'SET_SERVER_CART_ERROR',
					message: error.message,
				} );
			} );
	}, [ setServerCart, cacheStatus, responseCart, hookDispatch ] );
}
