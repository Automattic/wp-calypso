/** @format */

/**
 * Internal Dependencies
 */
import { APPLY_STORED_STATE } from 'state/action-types';
import { getStateFromLocalStorage } from 'state/initial-state';

const initializations = {};

function normalizeKey( key ) {
	return Array.isArray( key ) ? key.join( '.' ) : key;
}

async function initializeState( store, reducer, storageKey ) {
	const storedState = await getStateFromLocalStorage( reducer, storageKey );

	if ( storedState ) {
		store.dispatch( { type: APPLY_STORED_STATE, storageKey, storedState } );
	}
}

// For a given store, creates a function that adds a new reducer to the store,
// and loads (asynchronously) and applies the persisted state for it.
export const addReducerToStore = store => ( key, reducer ) => {
	const { storageKey } = reducer;
	const normalizedKey = normalizeKey( key );
	let init = initializations[ normalizedKey ];

	if ( ! init ) {
		store.addReducer( key, reducer );

		if ( storageKey ) {
			init = initializeState( store, reducer, storageKey );
		} else {
			init = Promise.resolve();
		}

		initializations[ normalizedKey ] = init;
	}

	return init;
};
