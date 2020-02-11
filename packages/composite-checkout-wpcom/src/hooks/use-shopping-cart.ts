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
	emptyResponseCart,
	removeItemFromResponseCart,
	addCouponToResponseCart,
	WPCOMCart,
	WPCOMCartItem,
	CheckoutCartItem,
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
 */
type ShoppingCartHookState = {
	responseCart: ResponseCart;
	couponStatus: CouponStatus;
	cacheStatus: CacheStatus;
};

const getInitialShoppingCartHookState: () => ShoppingCartHookState = () => {
	return {
		responseCart: emptyResponseCart,
		cacheStatus: 'fresh',
		couponStatus: 'fresh',
	};
};

// We'll start by reproducing the behavior of the current useState hooks.
// This type is not the end goal, but it's a minimally invasive step toward it.
type ShoppingCartHookAction =
	| { type: 'SET_RESPONSE_CART'; adjustResponseCart: ( ResponseCart ) => ResponseCart }
	| { type: 'SET_COUPON_STATUS'; newCouponStatus: CouponStatus }
	| { type: 'SET_CACHE_STATUS'; newCacheStatus: CacheStatus }
	| { type: 'REMOVE_CART_ITEM'; uuidToRemove: string }
	| { type: 'ADD_COUPON'; couponToAdd: string };

function shoppingCartHookReducer(
	state: ShoppingCartHookState,
	action: ShoppingCartHookAction
): ShoppingCartHookState {
	switch ( action.type ) {
		case 'SET_RESPONSE_CART':
			return {
				...state,
				responseCart: action.adjustResponseCart( state.responseCart ),
			};
		case 'SET_COUPON_STATUS':
			return {
				...state,
				couponStatus: action.newCouponStatus,
			};
		case 'SET_CACHE_STATUS':
			return {
				...state,
				cacheStatus: action.newCacheStatus,
			};
		case 'REMOVE_CART_ITEM':
			debug( 'removing item from cart with uuid', action.uuidToRemove );
			return {
				...state,
				responseCart: removeItemFromResponseCart( state.responseCart, action.uuidToRemove ),
				cacheStatus: 'invalid',
			};
		case 'ADD_COUPON': {
			const couponStatus = state.couponStatus;
			const newCoupon = action.couponToAdd;
			if ( couponStatus === 'applied' || couponStatus === 'pending' ) {
				debug( `coupon status is '${ couponStatus }'; not submitting again` );
				return state;
			}
			debug( 'submitting coupon', newCoupon );
			return {
				...state,
				responseCart: addCouponToResponseCart( state.responseCart, newCoupon ),
				couponStatus: 'pending',
				cacheStatus: 'invalid',
			};
		}
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
	addItem: ( WPCOMCartItem ) => void;
	removeItem: ( string ) => void;
	submitCoupon: ( string ) => void;
	couponStatus: CouponStatus;
	couponCode: string | null;
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
type CouponStatus = 'fresh' | 'pending' | 'applied' | 'invalid' | 'rejected';

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
 * @returns ShoppingCartManager
 */
export function useShoppingCart(
	cartKey: string | null,
	setCart: ( string, RequestCart ) => Promise< ResponseCart >,
	getCart: ( string ) => Promise< ResponseCart >,
	translate: ( string ) => string,
	showAddCouponSuccessMessage: ( string ) => void
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
	function setResponseCart( adjustResponseCart: ( ResponseCart ) => ResponseCart ): void {
		hookDispatch( { type: 'SET_RESPONSE_CART', adjustResponseCart } );
	}

	const couponStatus: CouponStatus = hookState.couponStatus;
	function setCouponStatus( newCouponStatus: CouponStatus ): void {
		hookDispatch( { type: 'SET_COUPON_STATUS', newCouponStatus } );
	}

	const cacheStatus: CacheStatus = hookState.cacheStatus;
	function setCacheStatus( newCacheStatus: CacheStatus ): void {
		hookDispatch( { type: 'SET_CACHE_STATUS', newCacheStatus } );
	}

	// Asynchronously initialize the cart. This should happen exactly once.
	useEffect( () => {
		if ( cacheStatus !== 'fresh' ) {
			return;
		}

		const initializeResponseCart = async () => {
			const response = await getServerCart();
			debug( 'initialized cart is', response );
			setResponseCart( () => response );

			if ( couponStatus === 'fresh' ) {
				if ( response.is_coupon_applied ) {
					setCouponStatus( 'applied' );
				}
			}

			setCacheStatus( 'valid' );
		};

		debug( `initializing the cart; cacheStatus is ${ cacheStatus }` );
		initializeResponseCart().catch( error => {
			// TODO: figure out what to do here
			setCacheStatus( 'error' );
			debug( 'error while initializing cart', error );
		} );
	}, [ getServerCart, cacheStatus ] );

	// Asynchronously re-validate when the cache is dirty.
	useEffect( () => {
		const fetchAndUpdate = async () => {
			debug( 'sending cart with responseCart', responseCart );
			const response = await setServerCart( prepareRequestCart( responseCart ) );
			debug( 'cart sent; new responseCart is', response );
			setResponseCart( () => response );

			if ( couponStatus === 'pending' ) {
				if ( response.is_coupon_applied ) {
					showAddCouponSuccessMessage( response.coupon );
					setCouponStatus( 'applied' );
				}

				if ( ! response.is_coupon_applied && response.coupon_discounts_integer?.length <= 0 ) {
					setCouponStatus( 'invalid' );
				}

				if ( ! response.is_coupon_applied && response.coupon_discounts_integer?.length > 0 ) {
					setCouponStatus( 'rejected' );
				}
			}

			setCacheStatus( 'valid' );
		};

		debug( 'considering sending cart to server; cacheStatus is', cacheStatus );
		if ( cacheStatus === 'invalid' ) {
			debug( 'updating the cart' );
			setCacheStatus( 'pending' );
			fetchAndUpdate().catch( error => {
				// TODO: figure out what to do here
				setCacheStatus( 'error' );
				debug( 'error while fetching cart', error );
			} );
		}
	}, [ cacheStatus, couponStatus, responseCart, showAddCouponSuccessMessage ] );

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
		[ responseCartToDisplay ]
	);

	const addItem: ( WPCOMCartItem ) => void = useCallback( itemToAdd => {
		debug( 'adding item to cart', itemToAdd );
		setResponseCart( currentResponseCart => ( {
			...currentResponseCart,
			products: [ ...currentResponseCart.products, itemToAdd ],
		} ) );
		setCacheStatus( 'invalid' );
	}, [] );

	const removeItem: ( string ) => void = useCallback( uuidToRemove => {
		hookDispatch( { type: 'REMOVE_CART_ITEM', uuidToRemove } );
	}, [] );

	const changePlanLength = ( planItem, planLength ) => {
		// TODO: change plan length
		debug( 'changing plan length in cart', planItem, planLength );
	};

	const updatePricesForAddress = address => {
		// TODO: updatePricesForAddress
		debug( 'updating prices for address in cart', address );
	};

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
		changePlanLength,
		updatePricesForAddress,
		submitCoupon,
		couponStatus,
		couponCode: cart.couponCode,
	} as ShoppingCartManager;
}
