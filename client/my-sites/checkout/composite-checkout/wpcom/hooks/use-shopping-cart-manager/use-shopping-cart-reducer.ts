/**
 * External dependencies
 */
import { useReducer } from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import {
	emptyResponseCart,
	removeItemFromResponseCart,
	addItemToResponseCart,
	replaceItemInResponseCart,
	addCouponToResponseCart,
	removeCouponFromResponseCart,
	addLocationToResponseCart,
	doesCartLocationDifferFromResponseCartLocation,
	ResponseCart,
} from '../../types';
import { ShoppingCartState, ShoppingCartAction, CouponStatus } from './types';

const debug = debugFactory( 'calypso:composite-checkout:use-shopping-cart-reducer' );

export default function useShoppingCartReducer() {
	return useReducer( shoppingCartReducer, getInitialShoppingCartState() );
}

function shoppingCartReducer(
	state: ShoppingCartState,
	action: ShoppingCartAction
): ShoppingCartState {
	const couponStatus = state.couponStatus;
	switch ( action.type ) {
		case 'REMOVE_CART_ITEM': {
			const uuidToRemove = action.uuidToRemove;
			debug( 'removing item from cart with uuid', uuidToRemove );
			return {
				...state,
				responseCart: removeItemFromResponseCart( state.responseCart, uuidToRemove ),
				cacheStatus: 'invalid',
			};
		}
		case 'ADD_CART_ITEM': {
			const { requestCartProductToAdd } = action;
			debug( 'adding item to cart', requestCartProductToAdd );
			return {
				...state,
				responseCart: addItemToResponseCart( state.responseCart, requestCartProductToAdd ),
				cacheStatus: 'invalid',
			};
		}
		case 'REPLACE_CART_ITEM': {
			const uuidToReplace = action.uuidToReplace;
			const newProductId = action.newProductId;
			const newProductSlug = action.newProductSlug;
			if ( state.variantRequestStatus === 'pending' ) {
				debug(
					`variant request status is '${ state.variantRequestStatus }'; not submitting again`
				);
				return state;
			}
			debug( `replacing item with uuid ${ uuidToReplace } by product slug`, newProductSlug );

			return {
				...state,
				responseCart: replaceItemInResponseCart(
					state.responseCart,
					uuidToReplace,
					newProductId,
					newProductSlug
				),
				cacheStatus: 'invalid',
				variantRequestStatus: 'pending',
				variantSelectOverride: [
					...state.variantSelectOverride.filter( ( item ) => item.uuid !== action.uuidToReplace ),
					{ uuid: action.uuidToReplace, overrideSelectedProductSlug: action.newProductSlug },
				],
			};
		}
		case 'CLEAR_VARIANT_SELECT_OVERRIDE':
			return {
				...state,
				variantSelectOverride: [],
			};
		case 'REMOVE_COUPON': {
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
		}
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
			const didAddCoupon = newCouponStatus === 'applied';

			return {
				...state,
				responseCart: response,
				couponStatus: newCouponStatus,
				cacheStatus: 'valid',
				variantRequestStatus: 'valid', // TODO: what if the variant doesn't actually change?
				shouldShowNotification: {
					...state.shouldShowNotification,
					didAddCoupon,
				},
			};
		}
		case 'DID_SHOW_ADD_COUPON_SUCCESS_MESSAGE':
			return {
				...state,
				shouldShowNotification: {
					...state.shouldShowNotification,
					didAddCoupon: false,
				},
			};
		case 'RAISE_ERROR':
			switch ( action.error ) {
				case 'GET_SERVER_CART_ERROR':
				case 'SET_SERVER_CART_ERROR':
					return {
						...state,
						cacheStatus: 'error',
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
		variantRequestStatus: 'fresh',
		variantSelectOverride: [],
		shouldShowNotification: {
			didAddCoupon: false,
		},
	};
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
		default:
			return currentCouponStatus;
	}
}
