/** @format */

/**
 * Internal Dependencies
 */
import Dispatcher from 'dispatcher';

let reduxStore = null;

export function setReduxStore( store ) {
	reduxStore = store;
}

/**
 * Get the state of the current redux store
 * @returns {Object} Redux state
 */
export function reduxGetState() {
	if ( ! reduxStore ) {
		return;
	}
	return reduxStore.getState();
}

/**
 * Dispatch an action against the current redux store
 */
export function reduxDispatch( ...args ) {
	if ( ! reduxStore ) {
		return;
	}
	reduxStore.dispatch( ...args );
}

function markedFluxAction( action ) {
	return Object.assign( {}, action, { type: `FLUX_${ action.type }` } );
}

// this is a Map<ActionType:string, transform:action=>action
const forwardActionMap = new Map();
forwardActionMap.set( 'RECEIVE_MEDIA_ITEM', markedFluxAction );
forwardActionMap.set( 'RECEIVE_MEDIA_ITEMS', markedFluxAction );

function forwardAction( { action = {} } ) {
	const transform = forwardActionMap.get( action.type );
	if ( transform ) {
		reduxDispatch( transform( action ) );
	}
}

Dispatcher.register( forwardAction );
