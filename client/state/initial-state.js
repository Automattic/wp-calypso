/**
 * External dependencies
 */
import debugModule from 'debug';
import { map, pick, throttle } from 'lodash';

/**
 * Internal dependencies
 */
import { APPLY_STORED_STATE } from 'calypso/state/action-types';
import { serialize, deserialize } from 'calypso/state/utils';
import { getAllStoredItems, setStoredItem, clearStorage } from 'calypso/lib/browser-storage';
import { isSupportSession } from 'calypso/lib/user/support-user-interop';
import config from '@automattic/calypso-config';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:state' );

const DAY_IN_HOURS = 24;
const HOUR_IN_MS = 3600000;
export const SERIALIZE_THROTTLE = 5000;
export const MAX_AGE = 7 * DAY_IN_HOURS * HOUR_IN_MS;

// Store the timestamp at which the module loads as a proxy for the timestamp
// when the server data (if any) was generated.
const bootTimestamp = Date.now();

/**
 * In-memory copy of persisted state.
 *
 * We load from browser storage into this cache on boot, and initialize state
 * from it, rather than asynchronously reading from browser storage for every
 * persisted reducer.
 */
let stateCache = {};

function deserializeStored( reducer, stored ) {
	const { _timestamp, ...state } = stored;
	return deserialize( reducer, state );
}

function shouldPersist() {
	return ! isSupportSession();
}

/**
 * Determines whether to add "sympathy" by randomly clearing out persistent
 * browser state and loading without it
 *
 * Can be overridden on the command-line with two flags:
 *   - ENABLE_FEATURES=force-sympathy yarn start (always sympathize)
 *   - ENABLE_FEATURES=no-force-sympathy yarn start (always prevent sympathy)
 *
 * If both of these flags are set, then `force-sympathy` takes precedence.
 *
 * @returns {boolean} Whether to clear persistent state on page load
 */
function shouldAddSympathy() {
	// If `force-sympathy` flag is enabled, always clear persistent state.
	if ( config.isEnabled( 'force-sympathy' ) ) {
		return true;
	}

	// If `no-force-sympathy` flag is enabled, never clear persistent state.
	if ( config.isEnabled( 'no-force-sympathy' ) ) {
		return false;
	}

	// Otherwise, in development mode, clear persistent state 25% of the time.
	if ( 'development' === process.env.NODE_ENV && Math.random() < 0.25 ) {
		return true;
	}

	// Otherwise, do not clear persistent state.
	return false;
}

// Verifies that the server-provided Redux state isn't too old.
// This is rarely a problem, and only comes up in extremely long-lived sessions.
function verifyBootTimestamp() {
	return bootTimestamp + MAX_AGE > Date.now();
}

// Verifies that the persisted Redux state isn't too old.
function verifyStateTimestamp( state ) {
	return state._timestamp && state._timestamp + MAX_AGE > Date.now();
}

export async function loadAllState() {
	try {
		const storedState = await getAllStoredItems( /^redux-state-/ );
		debug( 'fetched stored Redux state from persistent storage', storedState );
		stateCache = storedState ?? {};
	} catch ( error ) {
		debug( 'error while loading persisted Redux state:', error );
	}
}

export async function clearAllState() {
	stateCache = {};
	await clearStorage();
}

function getPersistenceKey( subkey, currentUserId ) {
	return getReduxStateKey( currentUserId ) + ( subkey ? ':' + subkey : '' );
}

function getReduxStateKey( currentUserId = null ) {
	return getReduxStateKeyForUserId( currentUserId );
}

function getReduxStateKeyForUserId( userId ) {
	if ( ! userId ) {
		return 'redux-state-logged-out';
	}
	return 'redux-state-' + userId;
}

async function persistentStoreState( reduxStateKey, storageKey, state, _timestamp ) {
	if ( storageKey !== 'root' ) {
		reduxStateKey += ':' + storageKey;
	}

	const newState = { ...state, _timestamp };
	const result = await setStoredItem( reduxStateKey, newState );
	stateCache[ reduxStateKey ] = newState;
	return result;
}

export function persistOnChange( reduxStore, currentUserId ) {
	if ( ! shouldPersist() ) {
		return () => {};
	}

	let prevState = null;

	const throttledSaveState = throttle(
		function () {
			const state = reduxStore.getState();
			if ( state === prevState ) {
				return;
			}

			prevState = state;

			const serializedState = serialize( reduxStore.getCurrentReducer(), state );
			const _timestamp = Date.now();
			const reduxStateKey = getReduxStateKey( currentUserId );

			const storeTasks = map( serializedState.get(), ( data, storageKey ) =>
				persistentStoreState( reduxStateKey, storageKey, data, _timestamp )
			);

			Promise.all( storeTasks ).catch( ( setError ) =>
				debug( 'failed to set redux-store state', setError )
			);
		},
		SERIALIZE_THROTTLE,
		{ leading: false, trailing: true }
	);

	if ( typeof window !== 'undefined' ) {
		window.addEventListener( 'beforeunload', throttledSaveState.flush );
	}

	const unsubscribe = reduxStore.subscribe( throttledSaveState );

	return () => {
		if ( typeof window !== 'undefined' ) {
			window.removeEventListener( 'beforeunload', throttledSaveState.flush );
		}

		unsubscribe();
		throttledSaveState.cancel();
	};
}

// Retrieve the initial state for the application, combining it from server and
// local persistence (server data gets priority).
// This function only handles legacy Redux state for the monolithic root reducer
// `loadAllState` must have completed first.
export function getInitialState( initialReducer, currentUserId ) {
	const storedState = getInitialPersistedState( initialReducer, currentUserId );
	const serverState = getInitialServerState( initialReducer );
	return { ...storedState, ...serverState };
}

// Retrieve the initial bootstrapped state from a server-side render.
// This function only handles legacy Redux state for the monolithic root reducer
function getInitialServerState( initialReducer ) {
	if ( typeof window !== 'object' || ! window.initialReduxState || isSupportSession() ) {
		return null;
	}

	const serverState = deserializeStored( initialReducer, window.initialReduxState );
	return pick( serverState, Object.keys( window.initialReduxState ) );
}

// Retrieve the initial persisted state from the cached local client data.
// This function only handles legacy Redux state for the monolithic root reducer
// `loadAllState` must have completed first.
function getInitialPersistedState( initialReducer, currentUserId ) {
	if ( ! shouldPersist() ) {
		return null;
	}

	if ( 'development' === process.env.NODE_ENV ) {
		window.resetState = () => clearAllState().then( () => window.location.reload( true ) );

		if ( shouldAddSympathy() ) {
			// eslint-disable-next-line no-console
			console.log(
				'%cSkipping initial state rehydration. (This runs during random page requests in the Calypso development environment, to simulate loading the application with an empty cache.)',
				'font-size: 14px; color: red;'
			);

			clearAllState();
			return null;
		}
	}

	let initialStoredState = getStateFromPersistence( initialReducer, undefined, currentUserId );
	const storageKeys = [ ...initialReducer.getStorageKeys() ];

	function loadReducerState( { storageKey, reducer } ) {
		const storedState = getStateFromPersistence( reducer, storageKey, currentUserId );

		if ( storedState ) {
			initialStoredState = initialReducer( initialStoredState, {
				type: APPLY_STORED_STATE,
				storageKey,
				storedState,
			} );
		}
	}

	for ( const item of storageKeys ) {
		loadReducerState( item );
	}

	return initialStoredState;
}

// Retrieve the initial state for a portion of state, from persisted data alone.
// This function handles both legacy and modularized Redux state.
// `loadAllState` must have completed first.
function getStateFromPersistence( reducer, subkey, currentUserId ) {
	const reduxStateKey = getPersistenceKey( subkey, currentUserId );

	const state = stateCache[ reduxStateKey ] ?? null;
	return deserializeState( subkey, state, reducer, false );
}

// Retrieve the initial state for a portion of state, choosing the freshest
// between server and local persisted data.
// This function handles both legacy and modularized Redux state.
// `loadAllState` must have completed first.
export function getStateFromCache( reducer, subkey, currentUserId ) {
	let reduxStateKey = getPersistenceKey( subkey, currentUserId );

	let serverState = null;

	if ( subkey && typeof window !== 'undefined' ) {
		serverState = window.initialReduxState?.[ subkey ] ?? null;
	}

	let persistedState = stateCache[ reduxStateKey ] ?? null;

	// Special case for handling signup flows where the user logs in halfway through.
	if ( ! persistedState && subkey === 'signup' ) {
		reduxStateKey = getPersistenceKey( subkey, null );
		persistedState = stateCache[ reduxStateKey ] ?? null;

		// If we are logged in, we no longer need the 'user' step in signup progress tree.
		if ( persistedState && persistedState.progress && persistedState.progress.user ) {
			delete persistedState.progress.user;
		}

		debug( 'fetched signup state from logged out state', persistedState );
	}

	// Default to server state, if it exists.
	let useServerState = serverState !== null;

	// Replace with persisted state if it's fresher.
	if ( persistedState?._timestamp && persistedState._timestamp > bootTimestamp ) {
		useServerState = false;
	}

	return deserializeState(
		subkey,
		useServerState ? serverState : persistedState,
		reducer,
		useServerState
	);
}

// Deserialize a portion of state.
// This function handles both legacy and modularized Redux state.
function deserializeState( subkey, state, reducer, isServerState = false ) {
	const origin = isServerState ? 'server' : 'persisted';

	try {
		if ( state === null ) {
			debug( `Redux state for subkey '${ subkey }' not found in ${ origin } data` );
			return null;
		}

		const validTimestamp = isServerState ? verifyBootTimestamp() : verifyStateTimestamp( state );

		if ( ! validTimestamp ) {
			debug( `${ origin } Redux state is too old, dropping` );
			return null;
		}

		const deserializedState = deserializeStored( reducer, state );
		if ( ! deserializedState ) {
			debug( `${ origin } Redux state failed to deserialize, dropping` );
			return null;
		}

		return deserializedState;
	} catch ( error ) {
		debug( `error while loading ${ origin } Redux state:`, error );
		return null;
	}
}
