import debugFactory from 'debug';
import { playQueuedActions } from './shopping-cart-reducer';
import type {
	ActionPromises,
	LastValidResponseCart,
	ShoppingCartState,
	ShoppingCartReducerDispatch,
	CacheStatus,
} from './types';

const debug = debugFactory( 'shopping-cart:state-based-actions' );

function fetchInitialCart(
	state: ShoppingCartState,
	dispatch: ShoppingCartReducerDispatch,
	lastCacheStatus: CacheStatus | ''
): void {
	const { cacheStatus } = state;
	if ( cacheStatus === 'fresh' && cacheStatus !== lastCacheStatus ) {
		debug( 'triggering fetch of initial cart' );
		dispatch( { type: 'FETCH_INITIAL_RESPONSE_CART' } );
		dispatch( { type: 'GET_CART_FROM_SERVER' } );
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
		dispatch( { type: 'SYNC_CART_TO_SERVER' } );
	}
}

function isStatePendingUpdate( state: ShoppingCartState, areActionsPending: boolean ) {
	return state.queuedActions.length > 0 || state.cacheStatus !== 'valid' || areActionsPending;
}

export function createTakeActionsBasedOnState(
	lastValidResponseCart: LastValidResponseCart,
	actionPromises: ActionPromises
): (
	state: ShoppingCartState,
	dispatch: ShoppingCartReducerDispatch,
	areActionsPending: boolean
) => void {
	let lastCacheStatus: CacheStatus | '' = '';

	const takeActionsBasedOnState = (
		state: ShoppingCartState,
		dispatch: ShoppingCartReducerDispatch,
		areActionsPending: boolean
	) => {
		const { cacheStatus } = state;
		debug(
			'cache status before state-based-actions is',
			cacheStatus,
			'and areActionsPending is',
			areActionsPending
		);
		fetchInitialCart( state, dispatch, lastCacheStatus );
		if ( ! isStatePendingUpdate( state, areActionsPending ) ) {
			lastValidResponseCart.update( state.responseCart );
			actionPromises.resolve( state.responseCart );
		}
		prepareInvalidCartForSync( state, dispatch, lastCacheStatus );
		playQueuedActions( state, dispatch );
		lastCacheStatus = cacheStatus;
		debug( 'running state-based-actions complete' );
	};
	return takeActionsBasedOnState;
}
