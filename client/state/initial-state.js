/** @format */

/**
 * External dependencies
 */

import debugModule from 'debug';
import { get, map, pick, throttle } from 'lodash';

/**
 * Internal dependencies
 */
import { createReduxStore } from 'state';
import initialReducer from 'state/reducer';
import { SERIALIZE, DESERIALIZE } from 'state/action-types';
import localforage from 'lib/localforage';
import { isSupportUserSession } from 'lib/user/support-user-interop';
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

function getInitialServerState() {
	// Bootstrapped state from a server-render
	if ( typeof window === 'object' && window.initialReduxState && ! isSupportUserSession() ) {
		const serverState = deserialize( window.initialReduxState, initialReducer );
		return pick( serverState, Object.keys( window.initialReduxState ) );
	}
	return {};
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
function verifyStoredState( state ) {
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

async function getStateFromLocalStorage() {
	const reduxStateKey = getReduxStateKey();

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

		const deserializedState = deserialize( storedState, initialReducer );

		if ( ! deserializedState ) {
			debug( 'stored Redux state failed to deserialize, dropping' );
			return null;
		}

		if ( ! verifyStoredState( deserializedState ) ) {
			debug( 'stored Redux state has invalid currentUser.id, dropping' );
			return null;
		}

		return deserializedState;
	} catch ( error ) {
		debug( 'error while loading stored Redux state:', error );
		return null;
	}
}

const loadInitialState = initialState => {
	debug( 'loading initial state', initialState );
	const serverState = getInitialServerState();
	const mergedState = Object.assign( {}, initialState, serverState );
	return createReduxStore( mergedState );
};

function getReduxStateKey() {
	const userData = user.get();
	const userId = userData && userData.ID ? userData.ID : null;
	return getReduxStateKeyForUserId( userId );
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
	const userId = state.currentUser && state.currentUser.id ? state.currentUser.id : null;
	return key === getReduxStateKeyForUserId( userId );
}

function localforageStoreState( reduxStateKey, storageKey, state, _timestamp ) {
	if ( storageKey !== 'root' ) {
		reduxStateKey += ':' + storageKey;
	}

	return localforage.setItem( reduxStateKey, Object.assign( {}, state, { _timestamp } ) );
}

export function persistOnChange( reduxStore, serializeState = serialize ) {
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

			// TODO: serialize with the current reducer rather than initial one once we
			// start updating the reducer dynamically.
			const serializedState = serializeState( state, initialReducer );
			const _timestamp = new Date();

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

	return reduxStore;
}

export default function createReduxStoreFromPersistedInitialState( reduxStoreReady ) {
	const shouldPersist = config.isEnabled( 'persist-redux' ) && ! isSupportUserSession();

	if ( 'development' === process.env.NODE_ENV ) {
		window.resetState = () => localforage.clear( () => location.reload( true ) );

		if ( shouldAddSympathy() ) {
			// eslint-disable-next-line no-console
			console.log(
				'%cSkipping initial state rehydration. (This runs during random page requests in the Calypso development environment, to simulate loading the application with an empty cache.)',
				'font-size: 14px; color: red;'
			);

			localforage.clear();

			return shouldPersist
				? reduxStoreReady( persistOnChange( createReduxStore( getInitialServerState() ) ) )
				: reduxStoreReady( createReduxStore( getInitialServerState() ) );
		}
	}

	if ( shouldPersist ) {
		return getStateFromLocalStorage()
			.then( loadInitialState )
			.then( persistOnChange )
			.then( reduxStoreReady );
	}

	debug( 'persist-redux is not enabled, building state from scratch' );
	reduxStoreReady( loadInitialState( {} ) );
}
