/**
 * External Dependencies
 */
import { Reducer, Store, Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

/**
 * Internal dependencies
 */
import { addReducerToStore, clear as clearReducers, WithAddReducer } from './add-reducer';
import { getInitialState } from './initial-state';

export type ReduxDispatch = ThunkDispatch< ReturnType< typeof getInitialState >, unknown, Action >;

type QueueEntry = [ string[], Reducer ];

let applicationStore: ( Store & WithAddReducer ) | undefined;
const reducerRegistrationQueue: QueueEntry[] = [];

export function setStore( store: Store & WithAddReducer ) {
	// Clear any previously added reducers when replacing an existing store.
	if ( applicationStore ) {
		clearReducers();
	}

	applicationStore = store;

	// Synchronously add all pending reducers.
	// These include reducers registered to previous stores, since their code has
	// already been loaded.
	for ( const [ key, reducer ] of reducerRegistrationQueue ) {
		addReducerToStore( applicationStore )( key, reducer );
	}
}

export function registerReducer( key: string[], reducer: Reducer ) {
	if ( applicationStore ) {
		// Register immediately.
		addReducerToStore( applicationStore )( key, reducer );
	}

	// Add to queue, for future stores.
	reducerRegistrationQueue.push( [ key, reducer ] );
}
