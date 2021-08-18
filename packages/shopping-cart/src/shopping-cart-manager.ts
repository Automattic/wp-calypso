import debugFactory from 'debug';
import {
	getShoppingCartManagerState,
	createSubscriptionManager,
	createLastValidResponseCartManager,
	createActionPromisesManager,
	noopManager,
} from './managers';
import { createActions } from './shopping-cart-actions';
import { getInitialShoppingCartState, shoppingCartReducer } from './shopping-cart-reducer';
import {
	createTakeActionsBasedOnState,
	prepareFreshCartForInitialFetch,
} from './state-based-actions';
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
} from './types';

const debug = debugFactory( 'shopping-cart:shopping-cart-manager' );

function createDispatchAndWaitForValid(
	dispatch: ShoppingCartReducerDispatch,
	actionPromises: ActionPromises
): DispatchAndWaitForValid {
	return ( action ) => {
		return new Promise< ResponseCart >( ( resolve ) => {
			dispatch( action );
			actionPromises.add( resolve );
		} );
	};
}

function createShoppingCartManager(
	cartKey: string,
	getCart: GetCart,
	setCart: SetCart
): ShoppingCartManager {
	let state = getInitialShoppingCartState();

	const subscriptionManager = createSubscriptionManager( cartKey );

	// When an action is dispatched that modifies the cart (eg:
	// addProductsToCart), the reducer modifies the `responseCart` stored in
	// state. That (incomplete) data is then sent off to the server to be
	// validated and filled-in with additional properties before being returned
	// to the ShoppingCartManager. Because of this, optimistic updating of the
	// cart is not possible (it may change significantly in that round trip) so
	// we don't want to return the raw `responseCart` to the consumer. Instead,
	// we keep a copy of the `responseCart` the last time the state had a `valid`
	// CacheStatus and pass that to our consumers. The consumers can use
	// `isPendingUpdate` to know when the cart data is updating.
	const lastValidResponseCart = createLastValidResponseCartManager( state );

	const syncManager = createCartSyncManager( cartKey, getCart, setCart );
	const actionPromises = createActionPromisesManager();
	const takeActionsBasedOnState = createTakeActionsBasedOnState(
		lastValidResponseCart,
		actionPromises,
		syncManager,
		subscriptionManager
	);

	// This is the main dispatcher for shopping cart actions. Dispatched actions
	// are synchronous, but they cannot be trusted until validated by a server
	// call, which is async. Most consumers can use the `subscribe` callback
	// combined with the `isPendingUpdate` flag to know when changes have been
	// completed but if a consumer needs to do something directly (eg: redirect
	// when cart changes are complete) , they can use `dispatchAndWaitForValid`
	// which is the dispatcher exported with the ShoppingCartManager's actions.
	let deferredStateCheck: ReturnType< typeof setTimeout >;
	const dispatch = ( action: ShoppingCartAction ) => {
		debug( `dispatching action for cartKey ${ cartKey }`, action.type );
		state = shoppingCartReducer( state, action );

		// We defer the state based actions so that multiple cart changes can be
		// batched together during the same run of the event loop.
		if ( deferredStateCheck ) {
			clearTimeout( deferredStateCheck );
		}
		deferredStateCheck = setTimeout( () => {
			takeActionsBasedOnState( state, dispatch );
		} );
	};

	// `dispatchAndWaitForValid` enhances the action dispatcher to return a
	// Promise that will resolve when the cart next reaches a `valid`
	// CacheStatus. This is the dispatcher used for all actions in the
	// ShoppingCartManager's public API.
	const dispatchAndWaitForValid = createDispatchAndWaitForValid( dispatch, actionPromises );
	const actions = createActions( dispatchAndWaitForValid );

	let cachedManagerState: ShoppingCartManagerState = getShoppingCartManagerState(
		state,
		lastValidResponseCart.get()
	);
	let lastState: ShoppingCartState = state;

	const getCachedManagerState = (): ShoppingCartManagerState => {
		if ( lastState !== state ) {
			cachedManagerState = getShoppingCartManagerState( state, lastValidResponseCart.get() );
			lastState = state;
		}
		return cachedManagerState;
	};

	let didInitialFetch = false;
	const initialFetch = () => {
		if ( didInitialFetch ) {
			return Promise.resolve( lastValidResponseCart.get() );
		}
		didInitialFetch = true;
		prepareFreshCartForInitialFetch( state, dispatch, '' );
		return new Promise< ResponseCart >( ( resolve ) => {
			actionPromises.add( resolve );
		} );
	};

	return {
		subscribe: subscriptionManager.subscribe,
		actions,
		getState: getCachedManagerState,
		fetchInitialCart: initialFetch,
	};
}

// The ShoppingCartManagerClient allows returning a ShoppingCartManager for
// each cart key and subscribing to changes on that manager.
export function createShoppingCartManagerClient( {
	getCart,
	setCart,
}: {
	getCart: GetCart;
	setCart: SetCart;
} ): ShoppingCartManagerClient {
	const managersByCartKey: Record< string, ShoppingCartManager > = {};

	function forCartKey( cartKey: string | undefined ): ShoppingCartManager {
		if ( ! cartKey ) {
			return noopManager;
		}

		if ( ! managersByCartKey[ cartKey ] ) {
			debug( `creating cart manager for "${ cartKey }"` );
			managersByCartKey[ cartKey ] = createShoppingCartManager( cartKey, getCart, setCart );
		}

		return managersByCartKey[ cartKey ];
	}

	return {
		forCartKey,
	};
}
