/**
 * External dependencies
 */
import { useEffect } from 'react';
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
import { CacheStatus, ShoppingCartAction, ReactStandardAction } from './types';

const debug = debugFactory( 'calypso:composite-checkout:use-cart-update-and-revalidate' );

export default function useCartUpdateAndRevalidate(
	cacheStatus: CacheStatus,
	responseCart: ResponseCart,
	setServerCart: ( arg0: RequestCart ) => Promise< ResponseCart >,
	hookDispatch: ( arg0: ShoppingCartAction ) => void,
	onEvent?: ( arg0: ReactStandardAction ) => void
): void {
	useEffect( () => {
		if ( cacheStatus !== 'invalid' ) {
			return;
		}

		const requestCart = convertResponseCartToRequestCart( responseCart );
		debug( 'sending edited cart to server', requestCart );

		hookDispatch( { type: 'REQUEST_UPDATED_RESPONSE_CART' } );

		// We need to add is_update so that we don't add a plan automatically when the cart gets updated (DWPO).
		setServerCart( { ...requestCart, is_update: true } )
			.then( ( response ) => {
				debug( 'updated cart is', response );
				hookDispatch( {
					type: 'RECEIVE_UPDATED_RESPONSE_CART',
					updatedResponseCart: convertRawResponseCartToResponseCart( response ),
				} );
				hookDispatch( { type: 'CLEAR_VARIANT_SELECT_OVERRIDE' } );
			} )
			.catch( ( error ) => {
				debug( 'error while fetching cart', error );
				hookDispatch( {
					type: 'RAISE_ERROR',
					error: 'GET_SERVER_CART_ERROR',
					message: error.message,
				} );
				// TODO: log the request (at least the products) so we can see why it failed
				onEvent?.( {
					type: 'CART_ERROR',
					payload: { type: 'SET_SERVER_CART_ERROR', message: error.message },
				} );
			} );
	}, [ setServerCart, cacheStatus, responseCart, onEvent, hookDispatch ] );
}
