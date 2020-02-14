/**
 * External dependencies
 */
import { useState, useEffect, useMemo, useCallback, useReducer } from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import {
	prepareRequestCart,
	ResponseCart,
	ResponseCartProduct,
	emptyResponseCart,
	removeItemFromResponseCart,
	addItemToResponseCart,
	replaceItemInResponseCart,
	processRawResponse,
	addCouponToResponseCart,
	addLocationToResponseCart,
	doesCartLocationDifferFromResponseCartLocation,
	WPCOMCart,
	WPCOMCartItem,
	CheckoutCartItem,
	CartLocation,
} from '../types';
import { translateWpcomCartToCheckoutCart } from '../lib/translate-cart';

const debug = debugFactory( 'composite-checkout-wpcom:shopping-cart-manager' );

/**
 *     * responseCart
 *         Stored shopping cart endpoint response. We manipulate this
 *         directly and pass it back to the endpoint on update events.
 *     * couponStatus
 *         Used to determine whether to render coupon input fields and
 *         coupon-related error messages.
 *     * cacheStatus
 *         Used to determine whether we need to re-validate the cart on
 *         the backend. We can't use responseCart directly to decide this
 *         in e.g. useEffect because this causes an infinite loop.
 *     * variantRequestStatus
 *         Used to allow updating the view immediately upon a variant
 *         change request.
 *     * shouldShowNotification
 *         Used to trigger calypso notification side effects on render
 */
type ShoppingCartHookState = {
	responseCart: ResponseCart;
	couponStatus: CouponStatus;
	cacheStatus: CacheStatus;
	variantRequestStatus: VariantRequestStatus;
	variantSelectOverride: { uuid: string; overrideSelectedProductSlug: string }[];
	shouldShowNotification: {
		didAddCoupon: boolean;
	};
};

const getInitialShoppingCartHookState: () => ShoppingCartHookState = () => {
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
};

type ShoppingCartHookAction =
	| { type: 'REMOVE_CART_ITEM'; uuidToRemove: string }
	| { type: 'ADD_CART_ITEM'; responseCartProductToAdd: ResponseCartProduct }
	| { type: 'SET_LOCATION'; location: CartLocation }
	| {
			type: 'REPLACE_CART_ITEM';
			uuidToReplace: string;
			newProductId: number;
			newProductSlug: string;
	  }
	| { type: 'CLEAR_VARIANT_SELECT_OVERRIDE' }
	| { type: 'ADD_COUPON'; couponToAdd: string }
	| { type: 'RECEIVE_INITIAL_RESPONSE_CART'; initialResponseCart: ResponseCart }
	| { type: 'REQUEST_UPDATED_RESPONSE_CART' }
	| { type: 'RECEIVE_UPDATED_RESPONSE_CART'; updatedResponseCart: ResponseCart }
	| { type: 'DID_SHOW_ADD_COUPON_SUCCESS_MESSAGE' }
	| { type: 'RAISE_ERROR'; error: ShoppingCartHookError };

type ShoppingCartHookError = 'GET_SERVER_CART_ERROR' | 'SET_SERVER_CART_ERROR';

function shoppingCartHookReducer(
	state: ShoppingCartHookState,
	action: ShoppingCartHookAction
): ShoppingCartHookState {
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
			const responseCartProductToAdd = action.responseCartProductToAdd;
			debug( 'adding item to cart', responseCartProductToAdd );
			return {
				...state,
				responseCart: addItemToResponseCart( state.responseCart, responseCartProductToAdd ),
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
					...state.variantSelectOverride.filter( item => item.uuid !== action.uuidToReplace ),
					{ uuid: action.uuidToReplace, overrideSelectedProductSlug: action.newProductSlug },
				],
			};
		}
		case 'CLEAR_VARIANT_SELECT_OVERRIDE':
			return {
				...state,
				variantSelectOverride: [],
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
	}

	return state;
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

/**
 * This module provides a hook for manipulating the shopping cart state,
 * bundled into a ShoppingCartManager object. All of the details of
 * validation and pricing are handled by the backend, and the details of
 * communicating with the backend are handled inside the hook. The interface
 * exposed by the hook consists of the following:
 *
 *     * isLoading: true if we are loading the cart
 *     * allowedPaymentMethods: the allowed payment method keys
 *     * items: the array of items currently in the cart
 *     * tax: the tax line item
 *     * total: the total price line item
 *     * credits: the credits available as a line item
 *     * addItem: callback for adding an item to the cart
 *     * removeItem: callback for removing an item from the cart
 */
export interface ShoppingCartManager {
	isLoading: boolean;
	allowedPaymentMethods: string[];
	items: WPCOMCartItem[];
	tax: CheckoutCartItem;
	total: CheckoutCartItem;
	subtotal: CheckoutCartItem;
	couponItem: CheckoutCartItem;
	credits: CheckoutCartItem;
	addItem: ( ResponseCartProduct ) => void;
	removeItem: ( string ) => void;
	submitCoupon: ( string ) => void;
	couponStatus: CouponStatus;
	couponCode: string | null;
	updateLocation: ( CartLocation ) => void;
	variantRequestStatus: VariantRequestStatus;
	variantSelectOverride: { uuid: string; overrideSelectedProductSlug: string }[];
}

/**
 * The custom hook keeps a cached version of the server cart, as well as a
 * cache status.
 *
 *   - 'fresh': Page has loaded and no requests have been sent.
 *   - 'invalid': Local cart data has been edited.
 *   - 'valid': Local cart has been reloaded from the server.
 *   - 'pending': Request has been sent, awaiting response.
 *   - 'error': Something went wrong.
 */
type CacheStatus = 'fresh' | 'valid' | 'invalid' | 'pending' | 'error';

/**
 * Possible states re. coupon submission.
 *
 *   - 'fresh': User has not (yet) attempted to apply a coupon.
 *   - 'pending': Coupon request has been sent, awaiting response.
 *   - 'applied': Coupon has been applied to the cart.
 *   - 'invalid': Coupon code is not recognized.
 *   - 'rejected': Valid code, but does not apply to the cart items.
 */
export type CouponStatus = 'fresh' | 'pending' | 'applied' | 'invalid' | 'rejected' | 'error';

/**
 * Possible states re. variant selection. Note that all variant
 * change requests share the same state; this means if there is more
 * than one item in the cart with variant options they will all be in
 * pending state at the same time. Right now this is moot because at most
 * one cart item (the plan, if it exists) can have a variant picker.
 * If later we want to allow variations on more than one cart item
 * It should be straightforward to adjust the type of ShoppingCartManager
 * to accommodate this. For now the extra complexity is not worth it.
 */
export type VariantRequestStatus = 'fresh' | 'pending' | 'valid' | 'error';

/**
 * Custom hook for managing state in the WPCOM checkout component.
 *
 * We need to allow users to make some simple changes to their
 * shopping cart during checkout; things like deleting items,
 * changing plan lengths, and removing domains. The rules around
 * how these changes can be made are complex and already implemented
 * on the backend via the shopping cart endpoint. So rather than
 * duplicate that logic here we let the server do it for us.
 *
 * The flow goes like this:
 *     1. The host page renders checkout as a component with
 *       this custom hook as a prop, after 'instantiating' it
 *       with REST callback wrappers.
 *     2. This hook maintains a copy of the latest endpoint response
 *       and updates it directly on edit events in checkout.
 *     3. When the cached response cart changes, we fetch an updated
 *       cart from the server and translate it into the format
 *       required by the checkout component. This data is otherwise
 *       not changed.
 *
 * @param cartKey
 *     The cart key. Will use 'no-site' if no key is set.
 * @param setCart
 *     An asynchronous wrapper around the wpcom shopping cart POST
 *     endpoint. We pass this in to make testing easier.
 *     @see WPCOM_JSON_API_Me_Shopping_Cart_Endpoint
 * @param getCart
 *     An asynchronous wrapper around the wpcom shopping cart GET
 *     endpoint. We pass this in to make testing easier.
 *     @see WPCOM_JSON_API_Me_Shopping_Cart_Endpoint
 * @param translate
 *     Localization function
 * @param showAddCouponSuccessMessage
 *     Takes a coupon code and displays a translated notice that
 *     the coupon was successfully applied.
 * @param onEvent
 *     Optional callback that Takes a React Standard Action object ( {
 *     type: string, payload?: any } ) for analytics.
 * @returns ShoppingCartManager
 */
export function useShoppingCart(
	cartKey: string | null,
	setCart: ( string, RequestCart ) => Promise< ResponseCart >,
	getCart: ( string ) => Promise< ResponseCart >,
	translate: ( string ) => string,
	showAddCouponSuccessMessage: ( string ) => void,
	onEvent?: ( object: { type: string; payload?: any } ) => void // eslint-disable-line @typescript-eslint/no-explicit-any
): ShoppingCartManager {
	cartKey = cartKey || 'no-site';
	const setServerCart = useCallback( cartParam => setCart( cartKey, cartParam ), [
		cartKey,
		setCart,
	] );
	const getServerCart = useCallback( () => getCart( cartKey ), [ cartKey, getCart ] );

	const [ hookState, hookDispatch ] = useReducer(
		shoppingCartHookReducer,
		getInitialShoppingCartHookState()
	);

	const responseCart: ResponseCart = hookState.responseCart;
	const couponStatus: CouponStatus = hookState.couponStatus;
	const cacheStatus: CacheStatus = hookState.cacheStatus;
	const variantRequestStatus: VariantRequestStatus = hookState.variantRequestStatus;
	const variantSelectOverride = hookState.variantSelectOverride;
	const shouldShowNotification = hookState.shouldShowNotification;

	// Asynchronously initialize the cart. This should happen exactly once.
	useEffect( () => {
		if ( cacheStatus !== 'fresh' ) {
			return;
		}

		debug( `initializing the cart; cacheStatus is ${ cacheStatus }` );

		getServerCart()
			.then( response => {
				debug( 'initialized cart is', response );
				hookDispatch( {
					type: 'RECEIVE_INITIAL_RESPONSE_CART',
					initialResponseCart: processRawResponse( response ),
				} );
			} )
			.catch( error => {
				// TODO: figure out what to do here
				debug( 'error while initializing cart', error );
				hookDispatch( { type: 'RAISE_ERROR', error: 'GET_SERVER_CART_ERROR' } );
				onEvent?.( { type: 'CART_ERROR', payload: { error: 'GET_SERVER_CART_ERROR' } } );
			} );
	}, [ getServerCart, cacheStatus, onEvent ] );

	// Asynchronously re-validate when the cache is dirty.
	useEffect( () => {
		if ( cacheStatus !== 'invalid' ) {
			return;
		}

		debug( 'sending edited cart to server', responseCart );

		hookDispatch( { type: 'REQUEST_UPDATED_RESPONSE_CART' } );

		setServerCart( prepareRequestCart( responseCart ) )
			.then( response => {
				debug( 'updated cart is', response );
				hookDispatch( {
					type: 'RECEIVE_UPDATED_RESPONSE_CART',
					updatedResponseCart: processRawResponse( response ),
				} );
				hookDispatch( { type: 'CLEAR_VARIANT_SELECT_OVERRIDE' } );
			} )
			.catch( error => {
				// TODO: figure out what to do here
				debug( 'error while fetching cart', error );
				hookDispatch( { type: 'RAISE_ERROR', error: 'SET_SERVER_CART_ERROR' } );
				onEvent?.( { type: 'CART_ERROR', payload: { error: 'SET_SERVER_CART_ERROR' } } );
			} );
	}, [ setServerCart, cacheStatus, responseCart, onEvent ] );

	// Keep a separate cache of the displayed cart which we regenerate only when
	// the cart has been downloaded
	const [ responseCartToDisplay, setResponseCartToDisplay ] = useState( responseCart );
	useEffect( () => {
		if ( cacheStatus === 'valid' ) {
			debug( 'updating the displayed cart to match the server cart' );
			setResponseCartToDisplay( responseCart );
		}
	}, [ responseCart, cacheStatus ] );

	// Translate the responseCart into the format needed in checkout.
	const cart: WPCOMCart = useMemo(
		() => translateWpcomCartToCheckoutCart( translate, responseCartToDisplay ),
		[ translate, responseCartToDisplay ]
	);

	useEffect( () => {
		if ( shouldShowNotification.didAddCoupon ) {
			showAddCouponSuccessMessage( responseCart.coupon );
			hookDispatch( { type: 'DID_SHOW_ADD_COUPON_SUCCESS_MESSAGE' } );
		}
	}, [ shouldShowNotification.didAddCoupon, responseCart.coupon, showAddCouponSuccessMessage ] );

	const addItem: ( ResponseCartProduct ) => void = useCallback( responseCartProductToAdd => {
		hookDispatch( { type: 'ADD_CART_ITEM', responseCartProductToAdd } );
	}, [] );

	const removeItem: ( string ) => void = useCallback( uuidToRemove => {
		hookDispatch( { type: 'REMOVE_CART_ITEM', uuidToRemove } );
	}, [] );

	const changeItemVariant: (
		uuidToReplace: string,
		newProductSlug: string,
		newProductId: number
	) => void = useCallback( ( uuidToReplace, newProductSlug, newProductId ) => {
		hookDispatch( { type: 'REPLACE_CART_ITEM', uuidToReplace, newProductSlug, newProductId } );
	}, [] );

	const updateLocation: ( CartLocation ) => void = useCallback( location => {
		debug( 'updating location for cart to', location );
		hookDispatch( { type: 'SET_LOCATION', location } );
	}, [] );

	const submitCoupon: ( string ) => void = useCallback( couponToAdd => {
		hookDispatch( { type: 'ADD_COUPON', couponToAdd } );
	}, [] );

	return {
		isLoading: cacheStatus === 'fresh',
		items: cart.items,
		tax: cart.tax,
		couponItem: cart.coupon,
		total: cart.total,
		subtotal: cart.subtotal,
		credits: cart.credits,
		errors: responseCart.messages?.errors ?? [],
		allowedPaymentMethods: cart.allowedPaymentMethods,
		addItem,
		removeItem,
		updateLocation,
		changeItemVariant,
		submitCoupon,
		couponStatus,
		couponCode: cart.couponCode,
		variantRequestStatus,
		variantSelectOverride,
	} as ShoppingCartManager;
}
