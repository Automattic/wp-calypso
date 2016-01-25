/**
 * External dependencies
 */
import debugModule from 'debug';
import localforage from 'localforage';

/**
 * Internal dependencies
 */
import { createReduxStore } from 'state';
import { reducer } from 'state';
import { TO_OBJECT, FROM_OBJECT } from 'state/action-types'

/**
 * Module variables
 */
const debug = debugModule( 'calypso:state' );

const localforageConfig = {
	name: 'calypso',
	storeName: 'calypso_store',
	description: 'Calypso Storage'
};

function toObject( state ) {
	return reducer( state, { type: TO_OBJECT } );
}

function fromObject( state ) {
	return reducer( state, { type: FROM_OBJECT } );
}

function loadInitialState( initialState ) {
	debug( 'loading initial state with', initialState );
	return createReduxStore( fromObject( initialState ) );
}

function loadInitialStateFailed( error ) {
	debug( 'failed to load initial redux-store state', error );
	return createReduxStore();
}

function persistOnChange( reduxStore ) {
	reduxStore.subscribe( function() {
		localforage.setItem( 'redux-state', toObject( reduxStore.getState() ) )
			.catch( ( setError ) => {
				debug( 'failed to set redux-store state', setError );
			} );
	} );
	return reduxStore;
}

export default function createReduxStoreFromPersistedInitialState( reduxStoreReady ) {
	localforage.config( localforageConfig );
	localforage.getItem( 'redux-state' )
		.then( loadInitialState )
		.catch( loadInitialStateFailed )
		.then( persistOnChange )
		.then( reduxStoreReady );
}

