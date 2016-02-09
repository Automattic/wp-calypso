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
	return reducer( state, { type: SERIALIZE } );
}

function deserialize( localforageState ) {
	const serverState = getInitialServerState();
	const mergedState = Object.assign( {}, localforageState, serverState );
	return reducer( mergedState, { type: DESERIALIZE } );
}

function loadInitialState( initialState ) {
	debug( 'loading initial state', initialState );
	if ( initialState === null ) {
		throw new Error( 'no initial state found in localforage' );
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

