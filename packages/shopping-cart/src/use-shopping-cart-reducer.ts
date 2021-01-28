/**
 * External dependencies
 */
import { useReducer, useEffect, Dispatch } from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import {
	removeItemFromResponseCart,
	addItemsToResponseCart,
	replaceAllItemsInResponseCart,
	replaceItemInResponseCart,
	addCouponToResponseCart,
	removeCouponFromResponseCart,
	addLocationToResponseCart,
	doesCartLocationDifferFromResponseCartLocation,
	doesResponseCartContainProductMatching,
} from './cart-functions';
import type { ResponseCart, ShoppingCartState, ShoppingCartAction, CouponStatus } from './types';
import { getEmptyResponseCart } from './empty-carts';

const debug = debugFactory( 'shopping-cart:use-shopping-cart-reducer' );
const emptyResponseCart = getEmptyResponseCart();

export default function useShoppingCartReducer(): [
	ShoppingCartState,
	Dispatch< ShoppingCartAction >
] {
	const [ hookState, hookDispatch ] = useReducer(
		shoppingCartReducer,
		getInitialShoppingCartState()
	);

	useEffect( () => {
		if ( hookState.queuedActions.length > 0 && hookState.cacheStatus === 'valid' ) {
			debug( 'cart is loaded; playing queued actions', hookState.queuedActions );
			hookDispatch( { type: 'CLEAR_QUEUED_ACTIONS' } );
			hookState.queuedActions.forEach( ( action: ShoppingCartAction ) => {
				hookDispatch( action );
			} );
			debug( 'cart is loaded; queued actions complete' );
		}
	}, [ hookState.queuedActions, hookState.cacheStatus ] );
	return [ hookState, hookDispatch ];
}

function shoppingCartReducer(
	state: ShoppingCartState,
	action: ShoppingCartAction
): ShoppingCartState {
	const couponStatus = state.couponStatus;

	// If the cacheStatus is 'fresh' or 'pending', then the initial cart has not
	// yet loaded and so we cannot make changes to it yet. We therefore will
	// queue any action that comes through during that time except for
	// 'RECEIVE_INITIAL_RESPONSE_CART' or 'RAISE_ERROR'.
	if (
		( state.cacheStatus === 'fresh' ||
			state.cacheStatus === 'pending' ||
			state.cacheStatus === 'fresh-pending' ) &&
		action.type !== 'RECEIVE_INITIAL_RESPONSE_CART' &&
		action.type !== 'RECEIVE_UPDATED_RESPONSE_CART' &&
		action.type !== 'FETCH_INITIAL_RESPONSE_CART' &&
		action.type !== 'RAISE_ERROR'
	) {
		if ( action.type === 'CART_RELOAD' ) {
			debug( 'cart has not yet loaded; ignoring reload action', action );
			return state;
		}
		debug( 'cart has not yet loaded; queuing requested action', action );
		return {
			...state,
			queuedActions: [ ...state.queuedActions, action ],
		};
	}

	debug( 'processing requested action', action );
	switch ( action.type ) {
		case 'FETCH_INITIAL_RESPONSE_CART':
			return { ...state, cacheStatus: 'fresh-pending' };

		case 'CART_RELOAD':
			debug( 'reloading cart from server' );
			return getInitialShoppingCartState();

		case 'CLEAR_QUEUED_ACTIONS':
			return { ...state, queuedActions: [] };

		case 'REMOVE_CART_ITEM': {
			const uuidToRemove = action.uuidToRemove;
			debug( 'removing item from cart with uuid', uuidToRemove );
			return {
				...state,
				responseCart: removeItemFromResponseCart( state.responseCart, uuidToRemove ),
				cacheStatus: 'invalid',
			};
		}

		case 'CART_PRODUCTS_ADD':
			debug( 'adding items to cart', action.products );
			return {
				...state,
				responseCart: addItemsToResponseCart( state.responseCart, action.products ),
				cacheStatus: 'invalid',
			};

		case 'CART_PRODUCTS_REPLACE_ALL':
			debug( 'replacing items in cart with', action.products );
			return {
				...state,
				responseCart: replaceAllItemsInResponseCart( state.responseCart, action.products ),
				cacheStatus: 'invalid',
			};

		case 'CART_PRODUCT_REPLACE': {
			const uuidToReplace = action.uuidToReplace;
			if (
				doesResponseCartContainProductMatching( state.responseCart, {
					uuid: uuidToReplace,
					...action.productPropertiesToChange,
				} )
			) {
				debug( `variant is already in cart; not submitting again` );
				return state;
			}
			debug( `replacing item with uuid ${ uuidToReplace } with`, action.productPropertiesToChange );
			return {
				...state,
				responseCart: replaceItemInResponseCart(
					state.responseCart,
					uuidToReplace,
					action.productPropertiesToChange
				),
				cacheStatus: 'invalid',
			};
		}

		case 'REMOVE_COUPON':
			if ( couponStatus !== 'applied' ) {
				debug( `coupon status is '${ couponStatus }'; not removing` );
				return state;
			}
			debug( 'removing coupon' );
			return {
				...state,
				responseCart: removeCouponFromResponseCart( state.responseCart ),
				couponStatus: 'fresh',
				cacheStatus: 'invalid',
			};

		case 'ADD_COUPON': {
			const newCoupon = action.couponToAdd;
			if ( couponStatus === 'applied' || couponStatus === 'pending' ) {
				debug( `coupon status is '${ couponStatus }'; not submitting again` );
				return state;
			}
			debug( 'adding coupon', newCoupon );
			return {
				...state,
				responseCart: addCouponToResponseCart( state.responseCart, newCoupon ),
				couponStatus: 'pending',
				cacheStatus: 'invalid',
			};
		}

		case 'RECEIVE_INITIAL_RESPONSE_CART': {
			const response = action.initialResponseCart;
			return {
				...state,
				responseCart: response,
				couponStatus: getUpdatedCouponStatus( couponStatus, response ),
				cacheStatus: 'valid',
			};
		}

		case 'REQUEST_UPDATED_RESPONSE_CART':
			return {
				...state,
				cacheStatus: 'pending',
			};

		case 'RECEIVE_UPDATED_RESPONSE_CART': {
			const response = action.updatedResponseCart;
			const newCouponStatus = getUpdatedCouponStatus( couponStatus, response );
			const cartKey = response.cart_key;
			const productSlugsInCart = response.products.map( ( product ) => product.product_slug );
			if ( cartKey === 'no-user' ) {
				removeItemFromLocalStorage( productSlugsInCart );
			}
			return {
				...state,
				responseCart: response,
				couponStatus: newCouponStatus,
				cacheStatus: 'valid',
			};
		}

		case 'RAISE_ERROR':
			switch ( action.error ) {
				case 'GET_SERVER_CART_ERROR':
				case 'SET_SERVER_CART_ERROR':
					return {
						...state,
						cacheStatus: 'error',
						loadingError: action.message,
						loadingErrorType: action.error,
					};
				default:
					return state;
			}

		case 'SET_LOCATION':
			if ( doesCartLocationDifferFromResponseCartLocation( state.responseCart, action.location ) ) {
				debug( 'setting location on cart', action.location );
				return {
					...state,
					responseCart: addLocationToResponseCart( state.responseCart, action.location ),
					cacheStatus: 'invalid',
				};
			}
			debug( 'cart location is the same; not updating' );
			return state;

		default:
			return state;
	}
}

function getInitialShoppingCartState(): ShoppingCartState {
	return {
		responseCart: emptyResponseCart,
		cacheStatus: 'fresh',
		couponStatus: 'fresh',
		queuedActions: [],
	};
}

function removeItemFromLocalStorage( productSlugsInCart: string[] ) {
	let cartItemsFromLocalStorage = null;
	try {
		cartItemsFromLocalStorage = JSON.parse( window.localStorage.getItem( 'shoppingCart' ) || '[]' );
	} catch ( err ) {
		return;
	}

	if ( ! Array.isArray( cartItemsFromLocalStorage ) ) {
		return;
	}

	const newCartItems = cartItemsFromLocalStorage.filter( ( product ) =>
		productSlugsInCart.includes( product.product_slug )
	);

	try {
		window.localStorage.setItem( 'shoppingCart', JSON.stringify( newCartItems ) );
	} catch ( err ) {
		return;
	}
}

function getUpdatedCouponStatus( currentCouponStatus: CouponStatus, responseCart: ResponseCart ) {
	const isCouponApplied = responseCart.is_coupon_applied;
	const couponDiscounts = responseCart.coupon_discounts_integer.length;

	switch ( currentCouponStatus ) {
		case 'fresh':
			return isCouponApplied ? 'applied' : currentCouponStatus;
		case 'pending': {
			if ( isCouponApplied ) {
				return 'applied';
			}
			if ( ! isCouponApplied && couponDiscounts <= 0 ) {
				return 'invalid';
			}
			if ( ! isCouponApplied && couponDiscounts > 0 ) {
				return 'rejected';
			}
			return 'error';
		}
		case 'applied':
			if ( ! isCouponApplied && couponDiscounts <= 0 ) {
				return 'invalid';
			}
			break;
		default:
			return currentCouponStatus;
	}

	return currentCouponStatus;
}
