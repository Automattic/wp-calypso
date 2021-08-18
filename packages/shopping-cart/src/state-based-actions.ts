import debugFactory from 'debug';
import { playQueuedActions } from './shopping-cart-reducer';
import type {
	ShoppingCartState,
	ShoppingCartReducerDispatch,
	LastValidResponseCart,
	ActionPromises,
	CacheStatus,
	CartSyncManager,
	SubscriptionManager,
} from './types';

const debug = debugFactory( 'shopping-cart:state-based-actions' );

export function prepareFreshCartForInitialFetch(
	state: ShoppingCartState,
	dispatch: ShoppingCartReducerDispatch,
	lastCacheStatus: CacheStatus | ''
): void {
	const { cacheStatus } = state;
	if ( cacheStatus === 'fresh' && cacheStatus !== lastCacheStatus ) {
		debug( 'triggering fetch of initial cart' );
		dispatch( { type: 'FETCH_INITIAL_RESPONSE_CART' } );
	}
}

function prepareInvalidCartForSync(
	state: ShoppingCartState,
	dispatch: ShoppingCartReducerDispatch,
	lastCacheStatus: CacheStatus | ''
): void {
	const { queuedActions, cacheStatus } = state;
	if (
		queuedActions.length === 0 &&
		cacheStatus === 'invalid' &&
		cacheStatus !== lastCacheStatus
	) {
		debug( 'triggering sync of cart to server' );
		dispatch( { type: 'REQUEST_UPDATED_RESPONSE_CART' } );
	}
}

function isStatePendingUpdate( state: ShoppingCartState ) {
	return state.queuedActions.length > 0 || state.cacheStatus !== 'valid';
}

export function createTakeActionsBasedOnState(
	lastValidResponseCart: LastValidResponseCart,
	actionPromises: ActionPromises,
	syncManager: CartSyncManager,
	subscriptionManager: SubscriptionManager
): ( state: ShoppingCartState, dispatch: ShoppingCartReducerDispatch ) => void {
	let lastCacheStatus: CacheStatus | '' = '';

	const takeActionsBasedOnState = (
		state: ShoppingCartState,
		dispatch: ShoppingCartReducerDispatch
	) => {
		const { cacheStatus } = state;
		debug( 'cache status before state-based-actions is', cacheStatus );
		prepareFreshCartForInitialFetch( state, dispatch, lastCacheStatus );
		prepareInvalidCartForSync( state, dispatch, lastCacheStatus );

		syncManager.fetchInitialCartFromServer( state, dispatch );
		syncManager.syncPendingCartToServer( state, dispatch );

		if ( ! isStatePendingUpdate( state ) ) {
			debug( 'updating lastValidResponseCart and resolving action promises' );
			lastValidResponseCart.update( state.responseCart );
			actionPromises.resolve( state.responseCart );
		}

		playQueuedActions( state, dispatch );

		lastCacheStatus = cacheStatus;

		subscriptionManager.notifySubscribers();

		debug( 'running state-based-actions complete' );
	};
	return takeActionsBasedOnState;
}
