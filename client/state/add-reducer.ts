/**
 * External Dependencies
 */
import { Reducer, Store } from 'redux';

/**
 * Internal Dependencies
 */
import { APPLY_STORED_STATE } from 'state/action-types';
import { getStateFromLocalStorage } from 'state/initial-state';

const initializations = new Map< string, Promise< void > >();
const reducers = new Map< string, Reducer >();

function normalizeKey( key: string[] ): string {
	return key.join( '.' );
}

interface OptionalStorageKey {
	storageKey?: string;
}

interface WithAddReducer {
	addReducer: ( keys: string[], subReducer: Reducer & OptionalStorageKey ) => void;
}

async function initializeState(
	store: Store & WithAddReducer,
	storageKey: string,
	reducer: Reducer & OptionalStorageKey
) {
	const storedState = await getStateFromLocalStorage( reducer, storageKey );

	if ( storedState ) {
		store.dispatch( { type: APPLY_STORED_STATE, storageKey, storedState } );
	}
}

// For a given store, creates a function that adds a new reducer to the store,
// and loads (asynchronously) and applies the persisted state for it.
export const addReducerToStore = < T extends Reducer & OptionalStorageKey >(
	store: Store & WithAddReducer
) => ( key: string[], reducer: T ): Promise< void > => {
	const storageKey: string | undefined = reducer.storageKey;
	const normalizedKey = normalizeKey( key );

	const previousReducer = reducers.get( normalizedKey );
	let init = initializations.get( normalizedKey );

	if ( previousReducer && reducer !== previousReducer ) {
		throw new Error(
			`Different reducers on multiple calls to \`addReducerToStore\` for key: ${ normalizedKey }`
		);
	}

	if ( ! init ) {
		store.addReducer( key, reducer );

		if ( storageKey ) {
			init = initializeState( store, storageKey, reducer );
		} else {
			init = Promise.resolve();
		}

		initializations.set( normalizedKey, init );
		reducers.set( normalizedKey, reducer );
	}

	return init;
};
