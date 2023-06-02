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
	// We defer the state based actions so that multiple cart changes can be
	// batched together during the same run of the event loop.
	let deferredStateCheck: number;
	return ( state, dispatch ) => {
		if ( deferredStateCheck ) {
			clearTimeout( deferredStateCheck );
		}
		deferredStateCheck = setTimeout( () => {
			debug( 'cache status before state-based-actions is', state.cacheStatus );
			prepareFreshCartForInitialFetch( state, dispatch, syncManager );
			prepareInvalidCartForSync( state, dispatch, syncManager );
			debug( 'running state-based-actions complete' );
		} );
	};
}
