/**
 * Internal Dependencies
 */
import Dispatcher from 'dispatcher';

let reduxStore = null;

let resolveReduxStorePromise;
const reduxStorePromise = new Promise( ( resolve ) => {
	resolveReduxStorePromise = resolve;
} );

export function setReduxStore( store ) {
	reduxStore = store;
	resolveReduxStorePromise( store );
}

/**
 * Asynchronously get the current Redux store. Returns a Promise that gets resolved only
 * after the store is set by `setReduxStore`.
 *
 * @returns {Promise<ReduxStore>} Promise of the Redux store object.
 */
export function getReduxStore() {
	return reduxStorePromise;
}

/**
 * Get the state of the current redux store
 *
 * @returns {object} Redux state
 */
export function reduxGetState() {
	if ( ! reduxStore ) {
		return;
	}
	return reduxStore.getState();
}

/**
 * Dispatch an action against the current redux store
 *
 * @returns {mixed} Result of the dispatch
 */
export function reduxDispatch( ...args ) {
	if ( ! reduxStore ) {
		return;
	}
	return reduxStore.dispatch( ...args );
}

function markedFluxAction( action ) {
	return Object.assign( {}, action, { type: `FLUX_${ action.type }` } );
}

// this is a Map<ActionType:string, transform:action=>action
const actionsToForward = new Set();

export function registerActionForward( actionName ) {
	actionsToForward.add( actionName );
}

export function clearActionForwards() {
	actionsToForward.clear();
}

function forwardAction( { action = {} } ) {
	if ( actionsToForward.has( action.type ) ) {
		reduxDispatch( markedFluxAction( action ) );
	}
}

Dispatcher.register( forwardAction );
