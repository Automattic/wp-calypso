/**
 * External dependencies
 */
import debugModule from 'debug';
import pick from 'lodash/pick';

/**
 * Internal dependencies
 */
import { createReduxStore, reducer } from 'state';
import { SERIALIZE, DESERIALIZE, SERVER_DESERIALIZE } from 'state/action-types'
import { getLocalForage } from 'lib/localforage';
import config from 'config';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:state' );
const localforage = getLocalForage();

const DAY_IN_HOURS = 24;
const HOUR_IN_MS = 3600000;
export const MAX_AGE = 7 * DAY_IN_HOURS * HOUR_IN_MS;

function getInitialServerState() {
	// Bootstrapped state from a server-render
	if ( typeof window === 'object' && window.initialReduxState ) {
		const serverState = reducer( window.initialReduxState, { type: SERVER_DESERIALIZE } );
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

function loadInitialState( initialState ) {
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
}

function loadInitialStateFailed( error ) {
	debug( 'failed to load initial redux-store state', error );
	return createReduxStore();
}

function persistOnChange( reduxStore ) {
	reduxStore.subscribe( function() {
		localforage.setItem( 'redux-state', serialize( reduxStore.getState() ) )
			.catch( ( setError ) => {
				debug( 'failed to set redux-store state', setError );
			} );
	} );
	return reduxStore;
}

export default function createReduxStoreFromPersistedInitialState( reduxStoreReady ) {
	if ( config.isEnabled( 'persist-redux' ) ) {
		localforage.getItem( 'redux-state' )
			.then( loadInitialState )
			.catch( loadInitialStateFailed )
			.then( persistOnChange )
			.then( reduxStoreReady );
	} else {
		debug( 'persist-redux is not enabled, building state from scratch' );
		reduxStoreReady( loadInitialState( {} ) );
	}
}

