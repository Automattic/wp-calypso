import { Reducer, Store } from 'redux';
import {
	addReducerToStore,
	clear as clearReducers,
	WithAddReducer,
	GetStoredState,
} from './add-reducer';

type QueueEntry = [ string[], Reducer ];

let currentAddReducer: ReturnType< typeof addReducerToStore > | undefined;
const reducerRegistrationQueue: QueueEntry[] = [];

export function setStore( store: Store & WithAddReducer, getStoredState?: GetStoredState ): void {
	// Clear any previously added reducers when replacing an existing store.
	if ( currentAddReducer ) {
		clearReducers();
	}

	currentAddReducer = addReducerToStore( store, getStoredState );

	// Synchronously add all pending reducers.
	// These include reducers registered to previous stores, since their code has
	// already been loaded.
	for ( const [ key, reducer ] of reducerRegistrationQueue ) {
		currentAddReducer( key, reducer );
	}
}

export function registerReducer( key: string[], reducer: Reducer ): void {
	if ( currentAddReducer ) {
		// Register immediately.
		currentAddReducer( key, reducer );
	}

	// Add to queue, for future stores.
	reducerRegistrationQueue.push( [ key, reducer ] );
}
