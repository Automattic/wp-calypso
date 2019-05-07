/**
 * Internal Dependencies
 */
import { APPLY_STORED_STATE } from 'state/action-types';
import { getStateFromLocalStorage } from 'state/initial-state';

const initializations = new Map< string, Promise< void > >();
const reducers = new Map< string, ( state: object, action: object ) => object >();

function normalizeKey( key: string[] ): string {
	return key.join( '.' );
}

async function initializeState(
	store: object,
	storageKey: string,
	reducer: ( state: object, action: object ) => object
) {
	const storedState = await getStateFromLocalStorage( reducer, storageKey );

	if ( storedState ) {
		store.dispatch( { type: APPLY_STORED_STATE, storageKey, storedState } );
	}
}

// For a given store, creates a function that adds a new reducer to the store,
// and loads (asynchronously) and applies the persisted state for it.
export const addReducerToStore = ( store: object ) => (
	key: string[],
	reducer: ( state: object, action: object ) => object
): Promise< void > => {
	const storageKey: string = reducer.storageKey;
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
