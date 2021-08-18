import debugFactory from 'debug';
import {
	convertResponseCartToRequestCart,
	convertRawResponseCartToResponseCart,
} from './cart-functions';
import type {
	RequestCart,
	ResponseCart,
	ShoppingCartState,
	ShoppingCartReducerDispatch,
} from './types';

const debug = debugFactory( 'shopping-cart:sync' );

export function syncCartToServer(
	state: ShoppingCartState,
	dispatch: ShoppingCartReducerDispatch,
	setServerCart: ( cart: RequestCart ) => Promise< ResponseCart >
): void {
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
}

export function initializeCartFromServer(
	dispatch: ShoppingCartReducerDispatch,
	getServerCart: () => Promise< ResponseCart >
): void {
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
}
