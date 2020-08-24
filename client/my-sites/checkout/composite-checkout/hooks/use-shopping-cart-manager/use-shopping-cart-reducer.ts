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
} from '../../types/backend/shopping-cart-endpoint';
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
				variantRequestStatus: 'valid', // TODO: what if the variant doesn't actually change?
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
		loadingError: '',
		cacheStatus: 'fresh',
		couponStatus: 'fresh',
		variantRequestStatus: 'fresh',
		variantSelectOverride: [],
	};
}

function removeItemFromLocalStorage( productSlugsInCart: string[] ) {
	const cartItemsFromLocalStorage = JSON.parse(
		window.localStorage.getItem( 'shoppingCart' ) || '[]'
	);

	if ( ! Array.isArray( cartItemsFromLocalStorage ) ) {
		return;
	}

	const newCartItems = cartItemsFromLocalStorage.filter( ( product ) =>
		productSlugsInCart.includes( product.product_slug )
	);

	try {
		window.localStorage.setItem( 'shoppingCart', JSON.stringify( newCartItems ) );
	} catch ( e ) {
		throw new Error( 'An unexpected error occured while saving your cart' );
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
		default:
			return currentCouponStatus;
	}
}
