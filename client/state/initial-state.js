/** @format */

/**
 * External dependencies
 */

import debugModule from 'debug';
import { get, pick, throttle } from 'lodash';

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

const loadInitialState = initialState => {
	debug( 'loading initial state', initialState );
	if ( initialState === null ) {
		debug( 'no initial state found in localforage' );
		initialState = {};
	}
	if ( initialState._timestamp && initialState._timestamp + MAX_AGE < Date.now() ) {
		debug( 'stored state is too old, building redux store from scratch' );
		initialState = {};
	}
	const localforageState = deserialize( initialState );
	const serverState = getInitialServerState();
	const mergedState = Object.assign( {}, localforageState, serverState );
	return createReduxStore( mergedState );
};

function loadInitialStateFailed( error ) {
	debug( 'failed to load initial redux-store state', error );
	return createReduxStore();
}

function isLoggedIn() {
	const userData = user.get();
	return !! userData && userData.ID;
}

function saveState( key, state, serializeState = serialize ) {
	return localforage.setItem( key, serializeState( state ) ).catch( setError => {
		debug( 'failed to set redux-store state as ' + key, setError );
	} );
}

export function persistOnChange( reduxStore, serializeState = serialize ) {
	let state;

	const throttledSaveState = throttle(
		function() {
			if ( ! isLoggedIn() ) {
				return;
			}

			const nextState = reduxStore.getState();
			if ( state && nextState === state ) {
				return;
			}

			state = nextState;

			return saveState( 'redux-state-' + user.get().ID, state, serializeState );
		},
		SERIALIZE_THROTTLE,
		{ leading: false, trailing: true }
	);

	if ( global.window ) {
		global.window.addEventListener( 'beforeunload', throttledSaveState.flush );
	}

	reduxStore.subscribe( throttledSaveState );

	return reduxStore;
}

export default function createReduxStoreFromPersistedInitialState( reduxStoreReady ) {
	const shouldPersist =
		config.isEnabled( 'persist-redux' ) && isLoggedIn() && ! isSupportUserSession();

	if ( 'development' === process.env.NODE_ENV ) {
		window.resetState = () => localforage.clear( () => location.reload( true ) );
		window.saveState = saveState;
		window.localforage = localforage;

		// without DE/SERIALIZE use:
		// saveState( 'redux-full-state-saved', JSON.parse( JSON.stringify( state ) ), x=>x ).then( console.log )
		const savedFullStateId = ( get( window, 'location.search', '' ).match(
			/[?&]restoreFullState=(.*?)(?:&|$)/
		) || [] )[ 1 ];
		debug( 'Full state id', savedFullStateId );

		if ( savedFullStateId ) {
			return localforage
				.getItem( 'redux-full-state-saved' )
				.then( state => ( debug( 'Loading full state:', state ), state ) )
				.then( createReduxStore )
				.then( reduxStoreReady );
		}

		const savedStateId = ( get( window, 'location.search', '' ).match(
			/[?&]restoreState=(.*?)(?:&|$)/
		) || [] )[ 1 ];
		debug( 'Saved state id', savedStateId );

		if ( savedStateId ) {
			debug( 'Loading saved state.', savedStateId );
			return (
				localforage
					.getItem( 'redux-state-saved' )

					// with DE/SERIALZE, use:
					// saveState( 'redux-state-saved', state ).then( console.log )
					.then( loadInitialState )
					.catch( loadInitialStateFailed )
					// Don't persist after load, but it that makes testing hard if we don't.
					.then( persistOnChange )
					.then( reduxStoreReady )
			);
		}

		if ( shouldAddSympathy() ) {
			// eslint-disable-next-line no-console
			console.log(
				'%cSkipping initial state rehydration to recreate first-load experience.',
				'font-size: 14px; color: red;'
			);

			localforage.clear();

			return shouldPersist
				? reduxStoreReady( persistOnChange( createReduxStore( getInitialServerState() ) ) )
				: reduxStoreReady( createReduxStore( getInitialServerState() ) );
		}
	}

	if ( shouldPersist ) {
		return localforage
			.getItem( 'redux-state-' + user.get().ID )
			.then( loadInitialState )
			.catch( loadInitialStateFailed )
			.then( persistOnChange )
			.then( reduxStoreReady );
	}

	debug( 'persist-redux is not enabled, building state from scratch' );
	reduxStoreReady( loadInitialState( {} ) );
}
