/** @format */

/**
 * External dependencies
 */

import debugModule from 'debug';
import { pick, throttle } from 'lodash';

/**
 * Internal dependencies
 */
import { createReduxStore, reducer } from 'state';
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

function getInitialServerState() {
	// Bootstrapped state from a server-render
	if ( typeof window === 'object' && window.initialReduxState && ! isSupportUserSession() ) {
		const serverState = reducer( window.initialReduxState, { type: DESERIALIZE } );
		return pick( serverState, Object.keys( window.initialReduxState ) );
	}
	return {};
}

function serialize( state ) {
	const serializedState = reducer( state, { type: SERIALIZE } );
	return Object.assign( serializedState, { _timestamp: Date.now() } );
}

function deserialize( state ) {
	delete state._timestamp;
	return reducer( state, { type: DESERIALIZE } );
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

function getStateFromLocalStorage() {
	const reduxStateKey = getReduxStateKey();
	return localforage.getItem( reduxStateKey ).then( function( initialState ) {
		debug( 'fetched initial state', initialState );
		if ( initialState === null ) {
			debug( 'no initial state found in localforage' );
			return {};
		}
		if ( initialState._timestamp && initialState._timestamp + MAX_AGE < Date.now() ) {
			debug( 'stored state is too old, building redux store from scratch' );
			return {};
		}
		const deserializedState = deserialize( initialState );
		// This check is most important to do on save (to prevent bad data
		// from being written to local storage in the first place). But it
		// is worth doing here also, on load, to prevent using historical
		// bad state data (from before this check was added) or any other
		// scenario where state data may have been stored without this
		// check being performed.
		if ( ! isValidReduxKeyAndState( reduxStateKey, deserializedState ) ) {
			debug(
				'stored state is invalid (storage key "' +
					reduxStateKey +
					'" does not match the state), building redux store from scratch'
			);
			return {};
		}
		return deserializedState;
	} );
}

const loadInitialState = initialState => {
	debug( 'loading initial state', initialState );
	const serverState = getInitialServerState();
	const mergedState = Object.assign( {}, initialState, serverState );
	return createReduxStore( mergedState );
};

function loadInitialStateFailed( error ) {
	debug( 'failed to load initial redux-store state', error );
	return createReduxStore();
}

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

export function persistOnChange( reduxStore, serializeState = serialize ) {
	let state, reduxStateKey;

	const throttledSaveState = throttle(
		function() {
			const nextState = reduxStore.getState();
			if ( state && nextState === state ) {
				return;
			}

			reduxStateKey = getReduxStateKey();
			if ( ! isValidReduxKeyAndState( reduxStateKey, nextState ) ) {
				return;
			}

			state = nextState;

			localforage.setItem( reduxStateKey, serializeState( state ) ).catch( setError => {
				debug( 'failed to set redux-store state', setError );
			} );
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
			.catch( loadInitialStateFailed )
			.then( persistOnChange )
			.then( reduxStoreReady );
	}

	debug( 'persist-redux is not enabled, building state from scratch' );
	reduxStoreReady( loadInitialState( {} ) );
}
