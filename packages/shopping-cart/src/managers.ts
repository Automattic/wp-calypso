import debugFactory from 'debug';
import { convertTempResponseCartToResponseCart } from './cart-functions';
import { getEmptyResponseCart } from './empty-carts';
import type {
	ShoppingCartManager,
	ShoppingCartState,
	ResponseCart,
	ShoppingCartManagerState,
	SubscribeCallback,
	UnsubscribeFunction,
	SubscriptionManager,
	AddActionPromise,
	ShoppingCartActionCreators,
} from './types';

const debug = debugFactory( 'shopping-cart:managers' );

export function getShoppingCartManagerState(
	state: ShoppingCartState,
	lastValidResponseCart: ResponseCart,
	areActionsPending: boolean
): ShoppingCartManagerState {
	const { cacheStatus, queuedActions, couponStatus, loadingErrorType, loadingError } = state;
	const isLoading = cacheStatus === 'fresh' || cacheStatus === 'fresh-pending';
	const isPendingUpdate =
		queuedActions.length > 0 || cacheStatus !== 'valid' || areActionsPending !== false;
	const loadingErrorForManager = cacheStatus === 'error' ? loadingError : null;
	debug(
		'manager isLoading',
		isLoading,
		'isPendingUpdate',
		isPendingUpdate,
		'loadingError',
		loadingErrorForManager
	);

	return {
		isLoading,
		loadingError: loadingErrorForManager,
		loadingErrorType,
		isPendingUpdate,
		couponStatus,
		responseCart: lastValidResponseCart,
	};
}

export function createSubscriptionManager( cartKey: string | undefined ): SubscriptionManager {
	let subscribedClients: SubscribeCallback[] = [];
	const subscribe = ( callback: SubscribeCallback ): UnsubscribeFunction => {
		debug( `adding subscriber for cartKey ${ cartKey }` );
		subscribedClients.push( callback );
		return () => {
			debug( `removing subscriber for cartKey ${ cartKey }` );
			subscribedClients = subscribedClients.filter( ( prevCallback ) => prevCallback !== callback );
		};
	};
	const notifySubscribers = () => {
		debug( `notifying ${ subscribedClients.length } subscribers for cartKey ${ cartKey }` );
		subscribedClients.forEach( ( clientCallback ) => clientCallback() );
	};

	return { subscribe, notifySubscribers };
}

export function createLastValidResponseCartManager(
	state: ShoppingCartState
): {
	getLastValidResponseCart: () => ResponseCart;
	updateLastValidResponseCart: ( state: ShoppingCartState, areActionsPending: boolean ) => void;
} {
	const { responseCart: initialResponseCart } = state;
	let lastValidResponseCart = convertTempResponseCartToResponseCart( initialResponseCart );

	const updateLastValidResponseCart = (
		updatedState: ShoppingCartState,
		areActionsPending: boolean
	): void => {
		const { queuedActions, cacheStatus, responseCart: tempResponseCart } = updatedState;
		if ( queuedActions.length === 0 && cacheStatus === 'valid' && areActionsPending === false ) {
			const responseCart = convertTempResponseCartToResponseCart( tempResponseCart );
			lastValidResponseCart = responseCart;
		}
	};

	return {
		getLastValidResponseCart: () => lastValidResponseCart,
		updateLastValidResponseCart,
	};
}

export function createActionPromisesManager(): {
	resolveActionPromisesIfValid: ( state: ShoppingCartState, areActionsPending: boolean ) => void;
	addActionPromise: AddActionPromise;
} {
	let actionPromises: ( ( cart: ResponseCart ) => void )[] = [];
	const resolveActionPromisesIfValid = (
		state: ShoppingCartState,
		areActionsPending: boolean
	): void => {
		const { queuedActions, cacheStatus, responseCart: tempResponseCart } = state;
		if (
			queuedActions.length === 0 &&
			cacheStatus === 'valid' &&
			actionPromises.length > 0 &&
			areActionsPending === false
		) {
			debug( `resolving ${ actionPromises.length } action promises` );
			const responseCart = convertTempResponseCartToResponseCart( tempResponseCart );
			actionPromises.forEach( ( callback ) => callback( responseCart ) );
			actionPromises = [];
		}
	};

	const addActionPromise: AddActionPromise = ( resolve ) => {
		actionPromises.push( resolve );
	};

	return { resolveActionPromisesIfValid, addActionPromise };
}

const emptyCart = getEmptyResponseCart();
const noopCartAction = (): ReturnType< ShoppingCartActionCreators[ 'addProductsToCart' ] > =>
	Promise.reject( 'Cart actions cannot be taken without a cart key.' );
export const noopManager: ShoppingCartManager = {
	subscribe: () => () => null,
	getState: () => ( {
		isLoading: true,
		loadingError: undefined,
		loadingErrorType: undefined,
		isPendingUpdate: true,
		couponStatus: 'fresh',
		responseCart: emptyCart,
	} ),
	actions: {
		addProductsToCart: noopCartAction,
		removeProductFromCart: noopCartAction,
		applyCoupon: noopCartAction,
		removeCoupon: noopCartAction,
		updateLocation: noopCartAction,
		replaceProductInCart: noopCartAction,
		replaceProductsInCart: noopCartAction,
		reloadFromServer: () => Promise.resolve( emptyCart ),
	},
	waitForReady: () => Promise.resolve( emptyCart ),
};
