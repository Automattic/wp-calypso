/** @format */

/**
 * Internal Dependencies
 */
import { APPLY_STORED_STATE } from 'state/action-types';
import { getStateFromLocalStorage } from 'state/initial-state';

const initializations = {};
const reducers = {};

function normalizeKey( key ) {
	return key.join( '.' );
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

	if ( init && reducer !== reducers[ normalizedKey ] ) {
		throw new Error(
			`Different reducers on multiple calls to \`addReducerToStore\` for key: ${ normalizedKey }`
		);
	}

	if ( ! init ) {
		store.addReducer( key, reducer );

		if ( storageKey ) {
			init = initializeState( store, reducer, storageKey );
		} else {
			init = Promise.resolve();
		}

		initializations[ normalizedKey ] = init;
		reducers[ normalizedKey ] = reducer;
	}

	return init;
};
