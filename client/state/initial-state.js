/**
 * External dependencies
 */
import debugModule from 'debug';
import pick from 'lodash/pick';
import throttle from 'lodash/throttle';

/**
 * Internal dependencies
 */
import {
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import localforage from 'lib/localforage';
import { isSupportUserSession } from 'lib/user/support-user-interop';
import config from 'config';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:state' );

const DAY_IN_HOURS = 24;
const HOUR_IN_MS = 3600000;
export const SERIALIZE_THROTTLE = 5000;
export const MAX_AGE = 7 * DAY_IN_HOURS * HOUR_IN_MS;

function getInitialServerState( reducer ) {
	// Bootstrapped state from a server-render
	if ( typeof window === 'object' && window.initialReduxState && ! isSupportUserSession() ) {
		const serverState = reducer( window.initialReduxState, { type: DESERIALIZE } );
		return pick( serverState, Object.keys( window.initialReduxState ) );
	}
	return {};
}

function serialize( reducer, state ) {
	const serializedState = reducer( state, { type: SERIALIZE } );
	return Object.assign( serializedState, { _timestamp: Date.now() } );
}

function deserialize( reducer, state ) {
	delete state._timestamp;
	return reducer( state, { type: DESERIALIZE } );
}

function loadInitialState( createReduxStore, reducer, initialState ) {
	debug( 'loading initial state', initialState );
	if ( initialState === null ) {
		debug( 'no initial state found in localforage' );
		initialState = {};
	}
	if ( initialState._timestamp && initialState._timestamp + MAX_AGE < Date.now() ) {
		debug( 'stored state is too old, building redux store from scratch' );
		initialState = {};
	}
	const localforageState = deserialize( reducer, initialState );
	const serverState = getInitialServerState( reducer );
	const mergedState = Object.assign( {}, localforageState, serverState );
	return createReduxStore( mergedState );
}

function loadInitialStateFailed( createReduxStore, error ) {
	debug( 'failed to load initial redux-store state', error );
	return createReduxStore();
}

export function persistOnChange( reducer, reduxStore, serializeState = serialize ) {
	let state;

	const throttledSaveState = throttle( function() {
		const nextState = reduxStore.getState();
		if ( state && nextState === state ) {
			return;
		}

		state = nextState;

		localforage.setItem( 'redux-state', serializeState( reducer, state ) )
			.catch( ( setError ) => {
				debug( 'failed to set redux-store state', setError );
			} );
	}, SERIALIZE_THROTTLE, { leading: false, trailing: true } );

	if ( global.window ) {
		global.window.addEventListener( 'beforeunload', throttledSaveState.flush );
	}

	reduxStore.subscribe( throttledSaveState );

	return reduxStore;
}

export default function createReduxStoreFromPersistedInitialState( reduxStoreReady ) {
	require.ensure( 'state', () => {
		const { createReduxStore, reducer } = require( 'state' );
		if ( config.isEnabled( 'persist-redux' ) && ! isSupportUserSession() ) {
			localforage.getItem( 'redux-state' )
				.then( loadInitialState.bind( null, createReduxStore, reducer ) )
				.catch( loadInitialStateFailed.bind( null, createReduxStore ) )
				.then( persistOnChange.bind( null, reducer ) )
				.then( reduxStoreReady );
		} else {
			debug( 'persist-redux is not enabled, building state from scratch' );
			reduxStoreReady( loadInitialState( createReduxStore, reducer, {} ) );
		}
	}, 'state' );
}
