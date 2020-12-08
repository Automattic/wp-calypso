/**
 * External dependencies
 */
import debugModule from 'debug';
import { map, pick, throttle } from 'lodash';

/**
 * Internal dependencies
 */
import { APPLY_STORED_STATE, SERIALIZE, DESERIALIZE } from 'calypso/state/action-types';
import { getAllStoredItems, setStoredItem, clearStorage } from 'calypso/lib/browser-storage';
import { isSupportSession } from 'calypso/lib/user/support-user-interop';
import config from 'calypso/config';
import user from 'calypso/lib/user';

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

function serialize( state, reducer ) {
	return reducer( state, { type: SERIALIZE } );
}

function deserialize( state, reducer ) {
	delete state._timestamp;
	return reducer( state, { type: DESERIALIZE } );
}

function shouldPersist() {
	return config.isEnabled( 'persist-redux' ) && ! isSupportSession();
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

// This check is most important to do on save (to prevent bad data
// from being written to local storage in the first place). But it
// is worth doing also on load, to prevent using historical
// bad state data (from before this check was added) or any other
// scenario where state data may have been stored without this
// check being performed.
function verifyStoredRootState( state ) {
	const currentUserId = user()?.get()?.ID ?? null;
	const storedUserId = state?.currentUser?.id ?? null;

	if ( currentUserId !== storedUserId ) {
		debug( `current user ID=${ currentUserId } and state user ID=${ storedUserId } don't match` );
		return false;
	}

	return true;
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

function getPersistenceKey( subkey, forceLoggedOutUser ) {
	return getReduxStateKey( forceLoggedOutUser ) + ( subkey ? ':' + subkey : '' );
}

function getReduxStateKey( forceLoggedOutUser = false ) {
	return getReduxStateKeyForUserId( forceLoggedOutUser ? null : user()?.get()?.ID ?? null );
}

function getReduxStateKeyForUserId( userId ) {
	if ( ! userId ) {
		return 'redux-state-logged-out';
	}
	return 'redux-state-' + userId;
}

function isValidReduxKeyAndState( key, state ) {
	// When the current user is changed (for example via logout) the previous
	// user's state remains in memory until the page refreshes. To prevent this
	// outdated state from being written to the new user's local storage, it is
	// necessary to check that the user IDs match. (This check can be removed
	// only if all places in the code that change the current user are also
	// able to force the state in memory to be rebuilt - possibly using
	// https://stackoverflow.com/questions/35622588/how-to-reset-the-state-of-a-redux-store/35641992#35641992
	// - without generating any errors. Until then, it must remain in place.)
	const userId = state?.currentUser?.id ?? null;
	return key === getReduxStateKeyForUserId( userId );
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

export function persistOnChange( reduxStore ) {
	if ( ! shouldPersist() ) {
		return;
	}

	let prevState = null;

	const throttledSaveState = throttle(
		function () {
			const state = reduxStore.getState();
			if ( state === prevState ) {
				return;
			}

			const reduxStateKey = getReduxStateKey();
			if ( ! isValidReduxKeyAndState( reduxStateKey, state ) ) {
				return;
			}

			prevState = state;

			const serializedState = serialize( state, reduxStore.getCurrentReducer() );
			const _timestamp = Date.now();

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

	reduxStore.subscribe( throttledSaveState );
}

// Retrieve the initial state for the application, combining it from server and
// local persistence (server data gets priority).
// This function only handles legacy Redux state for the monolithic root reducer
// `loadAllState` must have completed first.
export function getInitialState( initialReducer ) {
	const storedState = getInitialPersistedState( initialReducer );
	const serverState = getInitialServerState( initialReducer );
	return { ...storedState, ...serverState };
}

// Retrieve the initial bootstrapped state from a server-side render.
// This function only handles legacy Redux state for the monolithic root reducer
function getInitialServerState( initialReducer ) {
	if ( typeof window !== 'object' || ! window.initialReduxState || isSupportSession() ) {
		return null;
	}

	const serverState = deserialize( window.initialReduxState, initialReducer );
	return pick( serverState, Object.keys( window.initialReduxState ) );
}

// Retrieve the initial persisted state from the cached local client data.
// This function only handles legacy Redux state for the monolithic root reducer
// `loadAllState` must have completed first.
function getInitialPersistedState( initialReducer ) {
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

	let initialStoredState = getStateFromPersistence( initialReducer );
	const storageKeys = [ ...initialReducer.getStorageKeys() ];

	function loadReducerState( { storageKey, reducer } ) {
		const storedState = getStateFromPersistence( reducer, storageKey, false );

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
function getStateFromPersistence( reducer, subkey, forceLoggedOutUser = false ) {
	const reduxStateKey = getPersistenceKey( subkey, forceLoggedOutUser );

	const state = stateCache[ reduxStateKey ] ?? null;
	return deserializeState( subkey, state, reducer, false );
}

// Retrieve the initial state for a portion of state, choosing the freshest
// between server and local persisted data.
// This function handles both legacy and modularized Redux state.
// `loadAllState` must have completed first.
export function getStateFromCache( reducer, subkey ) {
	let reduxStateKey = getPersistenceKey( subkey, false );

	let serverState = null;

	if ( subkey && typeof window !== 'undefined' ) {
		serverState = window.initialReduxState?.[ subkey ] ?? null;
	}

	let persistedState = stateCache[ reduxStateKey ] ?? null;

	// Special case for handling signup flows where the user logs in halfway through.
	if ( ! persistedState && subkey === 'signup' ) {
		reduxStateKey = getPersistenceKey( subkey, true );
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

		const deserializedState = deserialize( state, reducer );
		if ( ! deserializedState ) {
			debug( `${ origin } Redux state failed to deserialize, dropping` );
			return null;
		}

		if ( ! subkey && ! verifyStoredRootState( deserializedState ) ) {
			debug( `${ origin } root Redux state has invalid currentUser.id, dropping` );
			return null;
		}

		return deserializedState;
	} catch ( error ) {
		debug( `error while loading ${ origin } Redux state:`, error );
		return null;
	}
}
