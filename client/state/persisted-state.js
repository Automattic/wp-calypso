import debugModule from 'debug';
import { getAllStoredItems, setStoredItem, clearStorage } from 'calypso/lib/browser-storage';

const debug = debugModule( 'calypso:state' );

/**
 * In-memory copy of persisted state.
 *
 * We load from browser storage into this cache on boot, and initialize state
 * from it, rather than asynchronously reading from browser storage for every
 * persisted reducer.
 */
let stateCache = {};

export async function loadPersistedState() {
	try {
		const storedState = await getAllStoredItems( /^(redux-state|query-state)-/ );
		debug( 'fetched persisted state from storage', storedState );
		stateCache = storedState ?? {};
	} catch ( error ) {
		debug( 'error while loading persisted state:', error );
	}
}

export async function clearPersistedState() {
	stateCache = {};
	await clearStorage();
}

export function getPersistedStateItem( key ) {
	return stateCache[ key ] ?? null;
}

export async function storePersistedStateItem( key, state ) {
	await setStoredItem( key, state );
	stateCache[ key ] = state;
}
