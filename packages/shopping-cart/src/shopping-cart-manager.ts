import debugFactory from 'debug';
import { cartKeysThatDoNotAllowFetch } from './cart-keys';
import { getEmptyResponseCart } from './empty-carts';
import {
	getShoppingCartManagerState,
	createSubscriptionManager,
	createLastValidResponseCartManager,
	createActionPromisesManager,
	noopManager,
} from './managers';
import { createActionCreators } from './shopping-cart-actions';
import { getInitialShoppingCartState, shoppingCartReducer } from './shopping-cart-reducer';
import { createTakeActionsBasedOnState } from './state-based-actions';
import { createCartSyncMiddleware, createCartInitMiddleware } from './sync';
import type {
	GetCart,
	SetCart,
	ShoppingCartManagerClient,
	ShoppingCartManagerState,
	ShoppingCartManager,
	RequestCart,
	ShoppingCartAction,
	ResponseCart,
	ShoppingCartReducerDispatch,
	DispatchAndWaitForValid,
	AddActionPromise,
	ShoppingCartState,
} from './types';

const debug = debugFactory( 'shopping-cart:shopping-cart-manager' );
const emptyCart = getEmptyResponseCart();
const getEmptyCart = () => Promise.resolve( emptyCart );

function createDispatchAndWaitForValid(
	dispatch: ShoppingCartReducerDispatch,
	addActionPromise: AddActionPromise
): DispatchAndWaitForValid {
	const dispatchAndWaitForValid: DispatchAndWaitForValid = ( action ) => {
		return new Promise< ResponseCart >( ( resolve ) => {
			dispatch( action );
			addActionPromise( resolve );
		} );
	};

	return dispatchAndWaitForValid;
}

function createShoppingCartManager(
	cartKey: string,
	getCart: GetCart,
	setCart: SetCart
): ShoppingCartManager {
	let state = getInitialShoppingCartState();

	const shouldNotFetchRealCart = cartKeysThatDoNotAllowFetch.includes( cartKey );

	const setServerCart = ( cartParam: RequestCart ) => setCart( cartKey, cartParam );
	const getServerCart = () => {
		if ( shouldNotFetchRealCart ) {
			return getEmptyCart();
		}
		return getCart( cartKey );
	};

	const syncCartToServer = createCartSyncMiddleware( setServerCart );
	const initializeCartFromServer = createCartInitMiddleware( getServerCart );
	const middleware = [ initializeCartFromServer, syncCartToServer ];

	const { subscribe, notifySubscribers } = createSubscriptionManager( cartKey );

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
	const {
		getLastValidResponseCart,
		updateLastValidResponseCart,
	} = createLastValidResponseCartManager( state );

	const { resolveActionPromisesIfValid, addActionPromise } = createActionPromisesManager();
	const takeActionsBasedOnState = createTakeActionsBasedOnState(
		updateLastValidResponseCart,
		resolveActionPromisesIfValid
	);

	// This is the main dispatcher for shopping cart actions. Dispatched actions
	// are async and non-blocking. Most consumers can use the `subscribe`
	// callback to know when changes have been made but if a consumer needs to
	// know when actions are complete, they can use `dispatchAndWaitForValid`
	// which is the dispatcher exported with the ShoppingCartManager's action
	// creators.
	let actionsPending = 0;
	const dispatch = ( action: ShoppingCartAction ) => {
		debug( `heard action request for cartKey ${ cartKey }`, action.type );
		actionsPending++;
		// setTimeout here defers the dispatch process until the next free cycle of
		// the JS event loop so that dispatching actions is async and will not
		// block any code that triggers them. Because we don't want to take certain
		// actions if there are more pending events, we track actionsPending to be
		// sure that all dispatched events eventually reach the reducer.
		setTimeout( () => {
			debug( `dispatching middleware action for cartKey ${ cartKey }`, action.type );
			actionsPending--;
			middleware.forEach( ( middlewareFn ) => {
				middlewareFn( action, state, dispatch );
			} );
			debug( `dispatching action for cartKey ${ cartKey }`, action.type );
			state = shoppingCartReducer( state, action );
			takeActionsBasedOnState( state, dispatch, actionsPending > 0 );
			notifySubscribers();
		} );
	};

	// `dispatchAndWaitForValid` enhances the action dispatcher to return a
	// Promise that will resolve when the cart next reaches a `valid`
	// CacheStatus. This is the dispatcher used for all actions in the
	// ShoppingCartManager's public API.
	const dispatchAndWaitForValid = createDispatchAndWaitForValid( dispatch, addActionPromise );
	const actionCreators = createActionCreators( dispatchAndWaitForValid );
	const waitForReady = () => {
		return new Promise< ResponseCart >( ( resolve ) => {
			addActionPromise( resolve );
		} );
	};

	let cachedManagerState: ShoppingCartManagerState = getShoppingCartManagerState(
		state,
		getLastValidResponseCart(),
		false
	);
	let lastState: ShoppingCartState = state;

	const getCachedManagerState = (): ShoppingCartManagerState => {
		if ( lastState !== state ) {
			cachedManagerState = getShoppingCartManagerState(
				state,
				getLastValidResponseCart(),
				actionsPending > 0
			);
			lastState = state;
		}
		return cachedManagerState;
	};

	// Kick off initial actions to load the cart.
	takeActionsBasedOnState( state, dispatch, false );

	return {
		subscribe,
		actions: actionCreators,
		getState: getCachedManagerState,
		waitForReady,
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
