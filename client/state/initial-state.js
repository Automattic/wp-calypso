/** @format */

/**
 * External dependencies
 */

import debugModule from 'debug';
import { get, map, pick, throttle } from 'lodash';

/**
 * Internal dependencies
 */
import { APPLY_STORED_STATE, SERIALIZE, DESERIALIZE } from 'state/action-types';
import localforage from 'lib/localforage';
import { isSupportSession } from 'lib/user/support-user-interop';
import config from 'config';
import User from 'lib/user';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:state' );
const user = User();

const DAY_IN_HOURS = 24;
const HOUR_IN_MS = 3600000;
export const SERIALIZE_THROTTLE = 5000;
export const MAX_AGE = 7 * DAY_IN_HOURS * HOUR_IN_MS;

function serialize( state, reducer ) {
	return reducer( state, { type: SERIALIZE } );
}

function deserialize( state, reducer ) {
	delete state._timestamp;
	return reducer( state, { type: DESERIALIZE } );
}

// get bootstrapped state from a server-side render
function getInitialServerState( initialReducer ) {
	if ( typeof window !== 'object' || ! window.initialReduxState || isSupportSession() ) {
		return null;
	}

	const serverState = deserialize( window.initialReduxState, initialReducer );
	return pick( serverState, Object.keys( window.initialReduxState ) );
}

function shouldPersist() {
	return config.isEnabled( 'persist-redux' ) && ! isSupportSession();
}

/**
 * Determines whether to add "sympathy" by randomly clearing out persistent
 * browser state and loading without it
 *
 * Can be overridden on the command-line with two flags:
 *   - ENABLE_FEATURES=force-sympathy npm start (always sympathize)
 *   - ENABLE_FEATURES=no-force-sympathy npm start (always prevent sympathy)
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
	const currentUserId = get( user.get(), 'ID', null );
	const storedUserId = get( state, [ 'currentUser', 'id' ], null );

	if ( currentUserId !== storedUserId ) {
		debug( `current user ID=${ currentUserId } and state user ID=${ storedUserId } don't match` );
		return false;
	}

	return true;
}

function verifyStateTimestamp( state ) {
	return state._timestamp && state._timestamp + MAX_AGE > Date.now();
}

export async function getStateFromLocalStorage( reducer, subkey ) {
	const reduxStateKey = getReduxStateKey() + ( subkey ? ':' + subkey : '' );

	try {
		const storedState = await localforage.getItem( reduxStateKey );
		debug( 'fetched stored Redux state from localforage', storedState );

		if ( storedState === null ) {
			debug( 'stored Redux state not found in localforage' );
			return null;
		}

		if ( ! verifyStateTimestamp( storedState ) ) {
			debug( 'stored Redux state is too old, dropping' );
			return null;
		}

		const deserializedState = deserialize( storedState, reducer );
		if ( ! deserializedState ) {
			debug( 'stored Redux state failed to deserialize, dropping' );
			return null;
		}

		if ( ! subkey && ! verifyStoredRootState( deserializedState ) ) {
			debug( 'stored root Redux state has invalid currentUser.id, dropping' );
			return null;
		}

		return deserializedState;
	} catch ( error ) {
		debug( 'error while loading stored Redux state:', error );
		return null;
	}
}

function getReduxStateKey() {
	return getReduxStateKeyForUserId( get( user.get(), 'ID', null ) );
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
	const userId = get( state, [ 'currentUser', 'id' ], null );
	return key === getReduxStateKeyForUserId( userId );
}

function localforageStoreState( reduxStateKey, storageKey, state, _timestamp ) {
	if ( storageKey !== 'root' ) {
		reduxStateKey += ':' + storageKey;
	}

	return localforage.setItem( reduxStateKey, Object.assign( {}, state, { _timestamp } ) );
}

export function persistOnChange( reduxStore ) {
	if ( ! shouldPersist() ) {
		return;
	}

	let prevState = null;

	const throttledSaveState = throttle(
		function() {
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
				localforageStoreState( reduxStateKey, storageKey, data, _timestamp )
			);

			Promise.all( storeTasks ).catch( setError =>
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

async function getInitialStoredState( initialReducer ) {
	if ( ! shouldPersist() ) {
		return null;
	}

	if ( 'development' === process.env.NODE_ENV ) {
		window.resetState = () => localforage.clear( () => location.reload( true ) );

		if ( shouldAddSympathy() ) {
			// eslint-disable-next-line no-console
			console.log(
				'%cSkipping initial state rehydration. (This runs during random page requests in the Calypso development environment, to simulate loading the application with an empty cache.)',
				'font-size: 14px; color: red;'
			);

			localforage.clear();
			return null;
		}
	}

	let initialStoredState = await getStateFromLocalStorage( initialReducer );
	if ( ! initialStoredState ) {
		return null;
	}

	const storageKeys = [ ...initialReducer.getStorageKeys() ];

	async function loadReducerState( { storageKey, reducer } ) {
		const storedState = await getStateFromLocalStorage( reducer, storageKey );
		if ( storedState ) {
			initialStoredState = initialReducer( initialStoredState, {
				type: APPLY_STORED_STATE,
				storageKey,
				storedState,
			} );
		}
	}

	await Promise.all( map( storageKeys, loadReducerState ) );

	return initialStoredState;
}

export async function getInitialState( initialReducer ) {
	const storedState = await getInitialStoredState( initialReducer );
	const serverState = getInitialServerState( initialReducer );
	return { ...storedState, ...serverState };
}
