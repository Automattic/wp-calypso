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
	ResponseCart,
	RequestCart,
	convertRawResponseCartToResponseCart,
} from '../../types/backend/shopping-cart-endpoint';
import { CacheStatus, ShoppingCartAction } from './types';

const debug = debugFactory( 'calypso:composite-checkout:use-cart-update-and-revalidate' );

export default function useCartUpdateAndRevalidate(
	cacheStatus: CacheStatus,
	responseCart: ResponseCart,
	setServerCart: ( arg0: RequestCart ) => Promise< ResponseCart >,
	hookDispatch: ( arg0: ShoppingCartAction ) => void
): void {
	const pendingResponseCart = useRef< ResponseCart >( responseCart );

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
				hookDispatch( { type: 'CLEAR_VARIANT_SELECT_OVERRIDE' } );
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
