/**
 * External dependencies
 */
import debugFactory from 'debug';
import type { Dispatch } from 'react';

/**
 * Internal dependencies
 */
import {
	convertResponseCartToRequestCart,
	convertRawResponseCartToResponseCart,
} from './cart-functions';
import type {
	RequestCart,
	ResponseCart,
	ShoppingCartState,
	ShoppingCartAction,
	ShoppingCartMiddleware,
} from './types';

const debug = debugFactory( 'shopping-cart:sync' );

export function createCartSyncMiddleware(
	setServerCart: ( cart: RequestCart ) => Promise< ResponseCart >
): ShoppingCartMiddleware {
	return function syncCartToServer(
		action: ShoppingCartAction,
		state: ShoppingCartState,
		dispatch: Dispatch< ShoppingCartAction >
	): void {
		if ( action.type !== 'SYNC_CART_TO_SERVER' ) {
			return;
		}

		if ( state.cacheStatus !== 'pending' ) {
			debug(
				`cache status (${ state.cacheStatus }) is not pending; not sending edited cart to server`
			);
			return;
		}

		const requestCart = convertResponseCartToRequestCart( state.responseCart );
		debug( 'sending edited cart to server', requestCart );

		setServerCart( requestCart )
			.then( ( response ) => {
				debug( 'update cart request complete', requestCart, '; updated cart is', response );
				dispatch( {
					type: 'RECEIVE_UPDATED_RESPONSE_CART',
					updatedResponseCart: convertRawResponseCartToResponseCart( response ),
				} );
			} )
			.catch( ( error ) => {
				debug( 'error while setting cart', error );
				dispatch( {
					type: 'RAISE_ERROR',
					error: 'SET_SERVER_CART_ERROR',
					message: error.message,
				} );
			} );
	};
}
