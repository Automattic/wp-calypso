import debugFactory from 'debug';
import { convertTempResponseCartToResponseCart } from './cart-functions';
import { getEmptyResponseCart } from './empty-carts';
import type {
	ShoppingCartManager,
	ShoppingCartState,
	SavedActionPromise,
	ShoppingCartManagerState,
	ShoppingCartManagerGetState,
	SubscribeCallback,
	UnsubscribeFunction,
	SubscriptionManager,
	ActionPromises,
	ShoppingCartManagerActions,
	CartKey,
} from './types';

const debug = debugFactory( 'shopping-cart:managers' );

export function getShoppingCartManagerState( state: ShoppingCartState ): ShoppingCartManagerState {
	const {
		cacheStatus,
		queuedActions,
		couponStatus,
		loadingErrorType,
		loadingError,
		lastValidResponseCart,
	} = state;
	const isLoading = cacheStatus === 'fresh' || cacheStatus === 'fresh-pending';
	const isPendingUpdate = queuedActions.length > 0 || cacheStatus !== 'valid';
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

export function createSubscriptionManager( cartKey: CartKey | undefined ): SubscriptionManager {
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
		subscribedClients.forEach( ( clientCallback ) => {
			try {
				clientCallback();
			} catch ( err ) {
				// eslint-disable-next-line no-console
				console.error(
					'An error ocurred while notifying a subscriber of a ShoppingCartManager change',
					( err as Error ).message
				);
				throw err;
			}
		} );
		debug( `completed notification of subscribers for cartKey ${ cartKey }` );
	};

	return { subscribe, notifySubscribers };
}

export function createActionPromisesManager(): ActionPromises {
	let actionPromises: SavedActionPromise[] = [];

	return {
		resolve( tempResponseCart ) {
			if ( actionPromises.length > 0 ) {
				debug( `resolving ${ actionPromises.length } action promises` );
				const responseCart = convertTempResponseCartToResponseCart( tempResponseCart );
				actionPromises.forEach( ( actionPromise ) => actionPromise.resolve( responseCart ) );
				actionPromises = [];
			}
		},

		reject( error ) {
			if ( actionPromises.length > 0 ) {
				debug( `rejecting ${ actionPromises.length } action promises` );
				actionPromises.forEach( ( actionPromise ) => actionPromise.reject( error ) );
				actionPromises = [];
			}
		},

		add( actionPromise: SavedActionPromise ) {
			actionPromises.push( actionPromise );
		},
	};
}

const emptyCart = getEmptyResponseCart();
const noopCartAction = (): ReturnType< ShoppingCartManagerActions[ 'addProductsToCart' ] > =>
	Promise.reject( 'Cart actions cannot be taken without a cart key.' );
const noopState: ShoppingCartManagerState = {
	isLoading: true,
	loadingError: undefined,
	loadingErrorType: undefined,
	isPendingUpdate: true,
	couponStatus: 'fresh',
	responseCart: emptyCart,
};
const noopGetState: ShoppingCartManagerGetState = () => noopState;
const noopActions: ShoppingCartManagerActions = {
	addProductsToCart: noopCartAction,
	removeProductFromCart: noopCartAction,
	applyCoupon: noopCartAction,
	removeCoupon: noopCartAction,
	updateLocation: noopCartAction,
	replaceProductInCart: noopCartAction,
	replaceProductsInCart: noopCartAction,
	reloadFromServer: () => Promise.resolve( emptyCart ),
	clearMessages: () => Promise.resolve( emptyCart ),
};
export const noopManager: ShoppingCartManager = {
	actions: noopActions,
	getState: noopGetState,
	subscribe: () => () => null,
	fetchInitialCart: () => Promise.resolve( emptyCart ),
};
