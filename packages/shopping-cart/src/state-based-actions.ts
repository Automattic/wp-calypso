import debugFactory from 'debug';
import { playQueuedActions } from './shopping-cart-reducer';
import { syncCartToServer, initializeCartFromServer } from './sync';
import type {
	ActionPromises,
	LastValidResponseCart,
	ShoppingCartState,
	ShoppingCartReducerDispatch,
	CacheStatus,
	RequestCart,
	ResponseCart,
} from './types';

const debug = debugFactory( 'shopping-cart:state-based-actions' );

function fetchInitialCart(
	state: ShoppingCartState,
	dispatch: ShoppingCartReducerDispatch,
	getServerCart: () => Promise< ResponseCart >,
	lastCacheStatus: CacheStatus | ''
): void {
	const { cacheStatus } = state;
	if ( cacheStatus === 'fresh' && cacheStatus !== lastCacheStatus ) {
		debug( 'triggering fetch of initial cart' );
		dispatch( { type: 'FETCH_INITIAL_RESPONSE_CART' } );
		initializeCartFromServer( dispatch, getServerCart );
	}
}

function prepareInvalidCartForSync(
	state: ShoppingCartState,
	dispatch: ShoppingCartReducerDispatch,
	setServerCart: ( cart: RequestCart ) => Promise< ResponseCart >,
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
		syncCartToServer( state, dispatch, setServerCart );
	}
}

function isStatePendingUpdate( state: ShoppingCartState, areActionsPending: boolean ) {
	return state.queuedActions.length > 0 || state.cacheStatus !== 'valid' || areActionsPending;
}

export function createTakeActionsBasedOnState(
	lastValidResponseCart: LastValidResponseCart,
	actionPromises: ActionPromises,
	getServerCart: () => Promise< ResponseCart >,
	setServerCart: ( cart: RequestCart ) => Promise< ResponseCart >
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
		fetchInitialCart( state, dispatch, getServerCart, lastCacheStatus );
		if ( ! isStatePendingUpdate( state, areActionsPending ) ) {
			lastValidResponseCart.update( state.responseCart );
			actionPromises.resolve( state.responseCart );
		}
		prepareInvalidCartForSync( state, dispatch, setServerCart, lastCacheStatus );
		playQueuedActions( state, dispatch );
		lastCacheStatus = cacheStatus;
		debug( 'running state-based-actions complete' );
	};
	return takeActionsBasedOnState;
}
