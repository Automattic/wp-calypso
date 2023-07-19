import debugFactory from 'debug';
import { cloneDeep } from 'lodash';
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
	CartKey,
} from './types';
import type { Dispatch } from 'react';

const debug = debugFactory( 'shopping-cart:sync' );
const emptyCart = getEmptyResponseCart();
const getEmptyCart = () => Promise.resolve( emptyCart );

export function createCartSyncManager(
	cartKey: CartKey,
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

	function mockResponse( response ) {
		const mockedResponse = cloneDeep( response );
		for ( const product of mockedResponse.products ) {
			if ( product.is_domain_registration ) {
				product.product_variants = [
					{
						introductory_offer_terms: {},
						price_before_discounts_integer: 900,
						price_integer: 900,
						bill_period_in_months: 12,
						currency: 'USD',
						product_id: 6,
						product_slug: 'domain_reg',
						volume: 1,
					},
					{
						introductory_offer_terms: {},
						price_before_discounts_integer: 1600,
						price_integer: 1600,
						bill_period_in_months: 24,
						currency: 'USD',
						product_id: 6,
						product_slug: 'domain_reg',
						volume: 2,
					},
				];
			}
		}

		return mockedResponse;
	}

	return {
		syncPendingCartToServer(
			state: ShoppingCartState,
			dispatch: Dispatch< ShoppingCartAction >
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
		},

		fetchInitialCartFromServer( dispatch: Dispatch< ShoppingCartAction > ): void {
			debug( 'fetching initial cart from server' );

			getServerCart()
				.then( ( response ) => {
					debug( 'initialized cart is', response );
					const initialResponseCart = convertRawResponseCartToResponseCart(
						// WIP | Temporary mock the response from the BE until we have a working Diff
						mockResponse( response )
					);
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
