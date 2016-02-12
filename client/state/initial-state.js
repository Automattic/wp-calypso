/**
 * External dependencies
 */
import debugModule from 'debug';
import localforage from 'localforage';

/**
 * Internal dependencies
 */
import { createReduxStore, reducer } from 'state';
import { SERIALIZE, DESERIALIZE } from 'state/action-types'
import config from 'config';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:state' );

const DAY_IN_HOURS = 24;
const HOUR_IN_MS = 3600000;
export const MAX_AGE = 7 * DAY_IN_HOURS * HOUR_IN_MS;

export const localforageConfig = {
	name: 'calypso',
	storeName: 'calypso_store',
	description: 'Calypso Storage'
};

function getInitialServerState() {
	// Bootstrapped state from a server-render
	if ( typeof window === 'object' && window.initialReduxState ) {
		return window.initialReduxState;
	}
	return {};
}

function serialize( state ) {
	const serializedState = reducer( state, { type: SERIALIZE } );
	return Object.assign( serializedState, { _timestamp: Date.now() } );
}

function deserialize( localforageState ) {
	delete localforageState._timestamp;
	const serverState = getInitialServerState();
	const mergedState = Object.assign( {}, localforageState, serverState );
	return reducer( mergedState, { type: DESERIALIZE } );
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
	return createReduxStore( deserialize( initialState ) );
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
		localforage.config( localforageConfig );
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

