import debugFactory from 'debug';
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
import type { Dispatch } from 'react';

const debug = debugFactory( 'shopping-cart:sync' );

export function createCartSyncMiddleware(
	setServerCart: ( cart: RequestCart ) => Promise< ResponseCart >
): ShoppingCartMiddleware {
	debug( 'creating cart sync middleware' );
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

export function createCartInitMiddleware(
	getServerCart: () => Promise< ResponseCart >
): ShoppingCartMiddleware {
	debug( 'creating cart init middleware' );
	return function initializeCartFromServer(
		action: ShoppingCartAction,
		state: ShoppingCartState,
		dispatch: Dispatch< ShoppingCartAction >
	): void {
		if ( action.type !== 'GET_CART_FROM_SERVER' ) {
			return;
		}

		if ( state.cacheStatus !== 'fresh-pending' ) {
			debug( `not initializing cart; cacheStatus ${ state.cacheStatus } is not fresh` );
			return;
		}
		debug( 'initializing cart' );

		getServerCart()
			.then( ( response ) => {
				debug( 'initialized cart is', response );
				const initialResponseCart = convertRawResponseCartToResponseCart( response );
				dispatch( {
					type: 'RECEIVE_INITIAL_RESPONSE_CART',
					initialResponseCart,
				} );
			} )
			.catch( ( error ) => {
				debug( 'error while initializing cart', error );
				dispatch( {
					type: 'RAISE_ERROR',
					error: 'GET_SERVER_CART_ERROR',
					message: error.message,
				} );
			} );
	};
}
