import debugFactory from 'debug';
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
	convertTempResponseCartToResponseCart,
} from './cart-functions';
import { getEmptyResponseCart } from './empty-carts';
import type {
	ResponseCart,
	ShoppingCartState,
	ShoppingCartAction,
	CouponStatus,
	CacheStatus,
} from './types';

const debug = debugFactory( 'shopping-cart:shopping-cart-reducer' );
const emptyResponseCart = getEmptyResponseCart();

const alwaysAllowedActions: ShoppingCartAction[ 'type' ][] = [
	'RECEIVE_INITIAL_RESPONSE_CART',
	'RECEIVE_UPDATED_RESPONSE_CART',
	'FETCH_INITIAL_RESPONSE_CART',
	'RAISE_ERROR',
];

const cacheStatusesForQueueing: CacheStatus[] = [ 'fresh', 'pending', 'fresh-pending' ];

const cacheStatusesForIgnoringReload: CacheStatus[] = [
	'invalid',
	'fresh',
	'pending',
	'fresh-pending',
];

function shouldPlayQueuedActions( state: ShoppingCartState ): boolean {
	return state.queuedActions.length > 0 && state.cacheStatus === 'valid';
}

export function isStatePendingUpdateOrQueuedAction( state: ShoppingCartState ): boolean {
	return state.queuedActions.length > 0 || state.cacheStatus !== 'valid';
}

function shouldQueueReducerEvent( cacheStatus: CacheStatus, action: ShoppingCartAction ): boolean {
	if ( alwaysAllowedActions.includes( action.type ) ) {
		return false;
	}
	if ( cacheStatusesForQueueing.includes( cacheStatus ) ) {
		return true;
	}
	return false;
}

export function reducerWithQueue(
	state: ShoppingCartState,
	action: ShoppingCartAction
): ShoppingCartState {
	if (
		cacheStatusesForIgnoringReload.includes( state.cacheStatus ) &&
		action.type === 'CART_RELOAD'
	) {
		debug( 'cart is pending an operation; ignoring reload action' );
		return state;
	}

	// If the cacheStatus is 'fresh' or 'pending', then the initial cart has not
	// yet loaded and so we cannot make changes to it yet. We therefore will
	// queue any action that comes through during that time except for
	// 'RECEIVE_INITIAL_RESPONSE_CART' or 'RAISE_ERROR'.
	if ( shouldQueueReducerEvent( state.cacheStatus, action ) ) {
		debug( 'cart has not yet loaded; queuing requested action', action );
		return {
			...state,
			queuedActions: [ ...state.queuedActions, action ],
		};
	}

	const lastState = state;
	state = shoppingCartReducer( state, action );

	if ( shouldPlayQueuedActions( state ) ) {
		debug( 'playing queued actions', state.queuedActions );
		const actions: ShoppingCartAction[] = [
			...state.queuedActions,
			{ type: 'CLEAR_QUEUED_ACTIONS' },
		];
		state = actions.reduce( shoppingCartReducer, state );
		debug( 'queued actions are dispatched and queue is cleared' );
	}

	// When an action is dispatched that modifies the cart, the reducer modifies
	// the `responseCart` stored in state. That data is then sent off to the
	// server to be validated and filled-in with additional properties before
	// being returned to the ShoppingCartManager. Because of this, optimistic
	// updating of the cart is not possible so we don't want to return the raw
	// `responseCart` to the consumer. Instead, we keep a copy of the
	// `responseCart` the last time the state had a `valid` CacheStatus and pass
	// that to our consumers. The consumers can use `isPendingUpdate` to know
	// when the cart data is updating.
	if ( state !== lastState && ! isStatePendingUpdateOrQueuedAction( state ) ) {
		state = shoppingCartReducer( state, { type: 'UPDATE_LAST_VALID_CART' } );
	}

	return state;
}

function shoppingCartReducer(
	state: ShoppingCartState,
	action: ShoppingCartAction
): ShoppingCartState {
	debug( 'processing requested action', action );
	const couponStatus = state.couponStatus;
	switch ( action.type ) {
		case 'UPDATE_LAST_VALID_CART':
			return {
				...state,
				lastValidResponseCart: convertTempResponseCartToResponseCart( state.responseCart ),
			};

		case 'FETCH_INITIAL_RESPONSE_CART':
			return {
				...state,
				cacheStatus: 'fresh-pending',
				loadingError: undefined,
				loadingErrorType: undefined,
			};

		case 'CART_RELOAD':
			debug( 'reloading cart from server' );
			return {
				...state,
				cacheStatus: 'fresh',
				loadingError: undefined,
				loadingErrorType: undefined,
			};

		case 'CLEAR_MESSAGES':
			return {
				...state,
				responseCart: { ...state.responseCart, messages: { errors: [], success: [] } },
			};

		case 'CLEAR_QUEUED_ACTIONS':
			return { ...state, queuedActions: [] };

		case 'REMOVE_CART_ITEM': {
			const uuidToRemove = action.uuidToRemove;
			debug( 'removing item from cart with uuid', uuidToRemove );
			return {
				...state,
				responseCart: removeItemFromResponseCart( state.responseCart, uuidToRemove ),
				cacheStatus: 'invalid',
				loadingError: undefined,
				loadingErrorType: undefined,
			};
		}

		case 'CART_PRODUCTS_ADD':
			debug( 'adding items to cart', action.products );
			return {
				...state,
				responseCart: addItemsToResponseCart( state.responseCart, action.products ),
				cacheStatus: 'invalid',
				loadingError: undefined,
				loadingErrorType: undefined,
			};

		case 'CART_PRODUCTS_REPLACE_ALL':
			debug( 'replacing items in cart with', action.products );
			return {
				...state,
				responseCart: replaceAllItemsInResponseCart( state.responseCart, action.products ),
				cacheStatus: 'invalid',
				loadingError: undefined,
				loadingErrorType: undefined,
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
				loadingError: undefined,
				loadingErrorType: undefined,
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
				loadingError: undefined,
				loadingErrorType: undefined,
			};

		case 'ADD_COUPON': {
			const newCoupon = action.couponToAdd;
			if (
				( couponStatus === 'applied' || couponStatus === 'pending' ) &&
				newCoupon === state.responseCart.coupon
			) {
				debug( `coupon status is '${ couponStatus }'; not submitting again` );
				return state;
			}
			debug( 'adding coupon', newCoupon );
			return {
				...state,
				responseCart: addCouponToResponseCart( state.responseCart, newCoupon ),
				couponStatus: 'pending',
				cacheStatus: 'invalid',
				loadingError: undefined,
				loadingErrorType: undefined,
			};
		}

		case 'RECEIVE_INITIAL_RESPONSE_CART': {
			const response = action.initialResponseCart;
			return {
				...state,
				responseCart: response,
				couponStatus: getUpdatedCouponStatus( couponStatus, response ),
				cacheStatus: 'valid',
				loadingError: undefined,
				loadingErrorType: undefined,
			};
		}

		case 'REQUEST_UPDATED_RESPONSE_CART':
			return {
				...state,
				cacheStatus: 'pending',
				loadingError: undefined,
				loadingErrorType: undefined,
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
				loadingError: undefined,
				loadingErrorType: undefined,
			};
		}

		case 'RAISE_ERROR':
			switch ( action.error ) {
				case 'GET_SERVER_CART_ERROR':
					return {
						...state,
						cacheStatus: 'error',
						loadingError:
							action.message ||
							'Error while fetching the shopping cart. Please check your network connection and try again.',
						loadingErrorType: action.error,
					};
				case 'SET_SERVER_CART_ERROR':
					return {
						...state,
						cacheStatus: 'error',
						loadingError:
							action.message ||
							'Error while updating the shopping cart endpoint. Please check your network connection and try again.',
						loadingErrorType: action.error,
					};
				default:
					return state;
			}

		case 'SET_LOCATION':
			if ( doesCartLocationDifferFromResponseCartLocation( state.responseCart, action.location ) ) {
				debug(
					'changing location on cart from',
					state.responseCart.tax.location,
					'to',
					action.location
				);
				return {
					...state,
					responseCart: addLocationToResponseCart( state.responseCart, action.location ),
					cacheStatus: 'invalid',
					loadingError: undefined,
					loadingErrorType: undefined,
				};
			}
			debug( 'cart location is the same; not updating' );
			return state;

		default:
			return state;
	}
}

export function getInitialShoppingCartState(): ShoppingCartState {
	return {
		responseCart: emptyResponseCart,
		lastValidResponseCart: emptyResponseCart,
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

function getUpdatedCouponStatus(
	currentCouponStatus: CouponStatus,
	responseCart: ResponseCart
): CouponStatus {
	const isCouponApplied = responseCart.is_coupon_applied;

	if ( isCouponApplied ) {
		return 'applied';
	}
	if ( currentCouponStatus === 'pending' ) {
		return 'rejected';
	}
	return 'fresh';
}
