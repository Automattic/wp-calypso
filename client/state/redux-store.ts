/**
 * External Dependencies
 */
import { Reducer, Store } from 'redux';

/**
 * Internal dependencies
 */
import { addReducerToStore, WithAddReducer } from './add-reducer';

type QueueEntry = [ string[], Reducer ];

let applicationStore: ( Store & WithAddReducer ) | undefined;
let reducerRegistrationQueue: QueueEntry[] = [];

export function setStore( store: Store & WithAddReducer ) {
	// Only set store once.
	if ( applicationStore ) {
		return;
	}

	applicationStore = store;
	// Synchronously add all pending reducers.
	for ( const [ key, reducer ] of reducerRegistrationQueue ) {
		addReducerToStore( applicationStore )( key, reducer );
	}
	// Clear registration queue to avoid dangling references.
	reducerRegistrationQueue = [];
}

export function registerReducer( key: string[], reducer: Reducer ) {
	if ( applicationStore ) {
		// Register immediately.
		addReducerToStore( applicationStore )( key, reducer );
		return;
	}

	reducerRegistrationQueue.push( [ key, reducer ] );
}
