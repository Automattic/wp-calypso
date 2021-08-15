import debugFactory from 'debug';
import { playQueuedActions } from './use-shopping-cart-reducer';
import type { ShoppingCartState, ShoppingCartReducerDispatch, CacheStatus } from './types';

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

export function createTakeActionsBasedOnState(
	updateLastValidResponseCart: ( state: ShoppingCartState, areActionsPending: boolean ) => void,
	resolveActionPromisesIfValid: ( state: ShoppingCartState, areActionsPending: boolean ) => void
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
		updateLastValidResponseCart( state, areActionsPending );
		resolveActionPromisesIfValid( state, areActionsPending );
		prepareInvalidCartForSync( state, dispatch, lastCacheStatus );
		playQueuedActions( state, dispatch );
		lastCacheStatus = cacheStatus;
		debug( 'running state-based-actions complete' );
	};
	return takeActionsBasedOnState;
}
