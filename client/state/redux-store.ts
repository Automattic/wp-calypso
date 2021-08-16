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
let applicationUserId: number | undefined;
const reducerRegistrationQueue: QueueEntry[] = [];

export function setStore( store: Store & WithAddReducer, currentUserId: number | undefined ): void {
	// Clear any previously added reducers when replacing an existing store.
	if ( applicationStore ) {
		clearReducers();
	}

	applicationStore = store;
	applicationUserId = currentUserId;

	// Synchronously add all pending reducers.
	// These include reducers registered to previous stores, since their code has
	// already been loaded.
	for ( const [ key, reducer ] of reducerRegistrationQueue ) {
		addReducerToStore( applicationStore, applicationUserId )( key, reducer );
	}
}

export function registerReducer( key: string[], reducer: Reducer ): void {
	if ( applicationStore ) {
		// Register immediately.
		addReducerToStore( applicationStore, applicationUserId )( key, reducer );
	}

	// Add to queue, for future stores.
	reducerRegistrationQueue.push( [ key, reducer ] );
}
