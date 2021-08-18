import debugFactory from 'debug';
import {
	convertResponseCartToRequestCart,
	convertRawResponseCartToResponseCart,
} from './cart-functions';
import { cartKeysThatDoNotAllowFetch } from './cart-keys';
import { getEmptyResponseCart } from './empty-carts';
import type {
	RequestCart,
	ShoppingCartState,
	ShoppingCartAction,
	CartSyncManager,
	GetCart,
	SetCart,
} from './types';
import type { Dispatch } from 'react';

const debug = debugFactory( 'shopping-cart:sync' );
const emptyCart = getEmptyResponseCart();
const getEmptyCart = () => Promise.resolve( emptyCart );

export function createCartSyncManager(
	cartKey: string,
	getCart: GetCart,
	setCart: SetCart
): CartSyncManager {
	const shouldNotFetchRealCart = cartKeysThatDoNotAllowFetch.includes( cartKey );

	const setServerCart = ( cartParam: RequestCart ) => setCart( cartKey, cartParam );
	const getServerCart = () => {
		if ( shouldNotFetchRealCart ) {
			return getEmptyCart();
		}
		return getCart( cartKey );
	};

	return {
		syncPendingCartToServer(
			state: ShoppingCartState,
			dispatch: Dispatch< ShoppingCartAction >
		): void {
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
		},

		fetchInitialCartFromServer(
			state: ShoppingCartState,
			dispatch: Dispatch< ShoppingCartAction >
		): void {
			if ( state.cacheStatus !== 'fresh-pending' ) {
				debug(
					`cache status (${ state.cacheStatus }) is not fresh-pending; not fetching initial cart`
				);
				return;
			}
			debug( 'fetching initial cart from server' );

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
		},
	};
}
