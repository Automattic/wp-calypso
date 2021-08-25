import debugFactory from 'debug';
import type { ShoppingCartState, ShoppingCartReducerDispatch, CartSyncManager } from './types';

const debug = debugFactory( 'shopping-cart:state-based-actions' );

export function prepareFreshCartForInitialFetch(
	state: ShoppingCartState,
	dispatch: ShoppingCartReducerDispatch,
	syncManager: CartSyncManager
): void {
	const { cacheStatus } = state;
	if ( cacheStatus === 'fresh' ) {
		debug( 'triggering fetch of initial cart' );
		dispatch( { type: 'FETCH_INITIAL_RESPONSE_CART' } );
		syncManager.fetchInitialCartFromServer( dispatch );
	}
}

function prepareInvalidCartForSync(
	state: ShoppingCartState,
	dispatch: ShoppingCartReducerDispatch,
	syncManager: CartSyncManager
): void {
	const { queuedActions, cacheStatus } = state;
	if ( queuedActions.length === 0 && cacheStatus === 'invalid' ) {
		debug( 'triggering sync of cart to server' );
		dispatch( { type: 'REQUEST_UPDATED_RESPONSE_CART' } );
		syncManager.syncPendingCartToServer( state, dispatch );
	}
}

export function createTakeActionsBasedOnState(
	syncManager: CartSyncManager
): ( state: ShoppingCartState, dispatch: ShoppingCartReducerDispatch ) => void {
	let lastState: ShoppingCartState;
	const takeActionsBasedOnState = (
		state: ShoppingCartState,
		dispatch: ShoppingCartReducerDispatch
	) => {
		if ( state === lastState ) {
			return;
		}
		lastState = state;
		const { cacheStatus } = state;
		debug( 'cache status before state-based-actions is', cacheStatus );
		prepareFreshCartForInitialFetch( state, dispatch, syncManager );
		prepareInvalidCartForSync( state, dispatch, syncManager );
		debug( 'running state-based-actions complete' );
	};
	return takeActionsBasedOnState;
}
