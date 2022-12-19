import debugFactory from 'debug';
import { findCartKeyFromSiteSlug } from './cart-functions';
import { CartActionError, CartActionConnectionError, CartActionResponseError } from './errors';
import {
	getShoppingCartManagerState,
	createSubscriptionManager,
	createActionPromisesManager,
	noopManager,
} from './managers';
import { createActions } from './shopping-cart-actions';
import {
	getInitialShoppingCartState,
	isStatePendingUpdateOrQueuedAction,
	reducerWithQueue as shoppingCartReducer,
} from './shopping-cart-reducer';
import { createTakeActionsBasedOnState } from './state-based-actions';
import { createCartSyncManager } from './sync';
import type {
	GetCart,
	SetCart,
	ShoppingCartManagerClient,
	ShoppingCartManagerState,
	ShoppingCartManager,
	ShoppingCartAction,
	ResponseCart,
	ShoppingCartReducerDispatch,
	DispatchAndWaitForValid,
	ActionPromises,
	ShoppingCartState,
	CartKey,
} from './types';

const debug = debugFactory( 'shopping-cart:shopping-cart-manager' );

/**
 * Enhance an action dispatcher to return a Promise that will resolve when the
 * cart next reaches a `valid` CacheStatus.
 *
 * This is the dispatcher used for all actions in the ShoppingCartManager's
 * public API.
 *
 * See `createActionPromisesManager` to learn about how the Promises are
 * tracked.
 */
function createDispatchAndWaitForValid(
	dispatch: ShoppingCartReducerDispatch,
	actionPromises: ActionPromises
): DispatchAndWaitForValid {
	return ( action ) => {
		return new Promise< ResponseCart >( ( resolve, reject ) => {
			actionPromises.add( { resolve, reject } );
			dispatch( action );
		} );
	};
}

/**
 * Return an error if the current state contains one.
 *
 * There are two types of things we consider an error in the state:
 *
 * 1. A loading error. This gets set when a network request (GET or POST) fails.
 * 2. Cart errors. These get set by the endpoint for invalid carts.
 *
 * If there is a loading error, the cart may be invalid indefinitely. However,
 * if the cart has errors, typically the cart is valid and can continue to be
 * used.
 */
function getErrorFromState( state: ShoppingCartState ): undefined | CartActionError {
	if ( state.loadingError ) {
		return new CartActionConnectionError( state.loadingError, state.loadingErrorType );
	}
	const errorMessages = state.responseCart.messages?.errors ?? [];
	if ( errorMessages.length > 0 ) {
		const firstMessage = errorMessages[ 0 ];
		return new CartActionResponseError( firstMessage.message, firstMessage.code );
	}
	return undefined;
}

function createShoppingCartManager(
	cartKey: CartKey,
	getCart: GetCart,
	setCart: SetCart
): ShoppingCartManager {
	let state = getInitialShoppingCartState();

	const subscriptionManager = createSubscriptionManager( cartKey );

	const syncManager = createCartSyncManager( cartKey, getCart, setCart );
	const actionPromises = createActionPromisesManager();
	const takeActionsBasedOnState = createTakeActionsBasedOnState( syncManager );

	const dispatch = ( action: ShoppingCartAction ) => {
		debug( `dispatching action for cartKey ${ cartKey }`, action.type );
		const newState = shoppingCartReducer( state, action );
		const isStateChanged = newState !== state;
		state = newState;

		if ( state.cacheStatus === 'error' ) {
			debug( 'cache status is error, so rejecting action promises' );
			actionPromises.reject(
				new CartActionConnectionError( state.loadingError, state.loadingErrorType )
			);
		}

		if ( ! isStatePendingUpdateOrQueuedAction( state ) ) {
			// action promises are resolved even if state hasn't changed so that
			// noop actions resolve immediately.
			const error = getErrorFromState( state );
			if ( error ) {
				actionPromises.reject( error );
			} else {
				actionPromises.resolve( state.responseCart );
			}
		}

		if ( isStateChanged ) {
			takeActionsBasedOnState( state, dispatch );
			subscriptionManager.notifySubscribers();
		}
	};

	// `dispatchAndWaitForValid` enhances the action dispatcher to return a
	// Promise that will resolve when the cart next reaches a `valid`
	// CacheStatus. This is the dispatcher used for all actions in the
	// ShoppingCartManager's public API.
	const dispatchAndWaitForValid = createDispatchAndWaitForValid( dispatch, actionPromises );
	const actions = createActions( dispatchAndWaitForValid );

	let cachedManagerState: ShoppingCartManagerState = getShoppingCartManagerState( state );
	let lastState: ShoppingCartState = state;

	const getCachedManagerState = (): ShoppingCartManagerState => {
		if ( lastState !== state ) {
			cachedManagerState = getShoppingCartManagerState( state );
			lastState = state;
		}
		return cachedManagerState;
	};

	let didInitialFetch = false;
	const initialFetch = () => {
		// Only perform initialFetch once. If it already ran, we return immediately
		// with the result.
		if ( didInitialFetch ) {
			const error = getErrorFromState( state );
			if ( error ) {
				debug( 'initial fetch called but it already ran and the current state has an error' );
				return Promise.reject( error );
			}
			debug( 'initial fetch called but it already ran; returning without doing anything' );
			return Promise.resolve( state.lastValidResponseCart );
		}
		didInitialFetch = true;

		// takeActionsBasedOnState on a fresh cart will triger an initial fetch.
		debug( 'initial fetch called and has not been called before' );
		takeActionsBasedOnState( state, dispatch );
		return new Promise< ResponseCart >( ( resolve, reject ) => {
			actionPromises.add( { resolve, reject } );
		} );
	};

	return {
		subscribe: subscriptionManager.subscribe,
		actions,
		getState: getCachedManagerState,
		fetchInitialCart: initialFetch,
	};
}

export function createShoppingCartManagerClient( {
	getCart,
	setCart,
}: {
	getCart: GetCart;
	setCart: SetCart;
} ): ShoppingCartManagerClient {
	const managersByCartKey = new Map< CartKey, ShoppingCartManager >();

	function forCartKey( cartKey: CartKey | undefined ): ShoppingCartManager {
		if ( ! cartKey ) {
			return noopManager;
		}

		let manager = managersByCartKey.get( cartKey );
		if ( typeof manager === 'undefined' ) {
			debug( `creating cart manager for "${ cartKey }"` );
			manager = createShoppingCartManager( cartKey, getCart, setCart );
			managersByCartKey.set( cartKey, manager );
		}
		return manager;
	}

	return {
		forCartKey,
		getCartKeyForSiteSlug: ( siteSlug: string ) => findCartKeyFromSiteSlug( siteSlug, getCart ),
	};
}
