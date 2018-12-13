/** @format */

/**
 * Internal Dependencies
 */

import { APPLY_STORED_STATE } from 'state/action-types';
import { getStateFromLocalStorage } from 'state/initial-state';

// For a given store, creates a function that adds a new reducer to the store,
// and loads (asynchronously) and applies the persisted state for it.
export const addReducerToStore = store => async ( key, reducer ) => {
	store.addReducer( key, reducer );

	const { storageKey } = reducer;
	if ( ! storageKey ) {
		return;
	}

	const storedState = await getStateFromLocalStorage( reducer, storageKey );
	if ( ! storedState ) {
		return;
	}

	store.dispatch( { type: APPLY_STORED_STATE, storageKey, storedState } );
};
