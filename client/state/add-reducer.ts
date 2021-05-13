/**
 * External Dependencies
 */
import { Reducer, Store } from 'redux';

/**
 * Internal Dependencies
 */
import { APPLY_STORED_STATE } from 'calypso/state/action-types';
import { getStateFromCache } from 'calypso/state/initial-state';

const initializations = new Map< string, boolean >();
const reducers = new Map< string, Reducer >();

function normalizeKey( key: string[] ): string {
	return key.join( '.' );
}

interface OptionalStorageKey {
	storageKey?: string;
}

export interface WithAddReducer {
	addReducer: ( keys: string[], subReducer: Reducer & OptionalStorageKey ) => void;
}

export function clear() {
	initializations.clear();
	reducers.clear();
}

function initializeState(
	store: Store & WithAddReducer,
	storageKey: string,
	reducer: Reducer & OptionalStorageKey
) {
	const storedState = getStateFromCache( reducer, storageKey );

	if ( storedState ) {
		store.dispatch( { type: APPLY_STORED_STATE, storageKey, storedState } );
	}
}

// For a given store, creates a function that adds a new reducer to the store,
// and loads (asynchronously) and applies the persisted state for it.
export const addReducerToStore = < T extends Reducer & OptionalStorageKey >(
	store: Store & WithAddReducer
) => ( key: string[], reducer: T ): void => {
	const storageKey: string | undefined = reducer.storageKey;
	const normalizedKey = normalizeKey( key );

	const previousReducer = reducers.get( normalizedKey );
	const init = initializations.get( normalizedKey );

	if ( previousReducer && reducer !== previousReducer ) {
		throw new Error(
			`Different reducers on multiple calls to \`addReducerToStore\` for key: ${ normalizedKey }`
		);
	}

	if ( ! init ) {
		store.addReducer( key, reducer );

		if ( storageKey ) {
			initializeState( store, storageKey, reducer );
		}

		initializations.set( normalizedKey, true );
		reducers.set( normalizedKey, reducer );
	}
};
