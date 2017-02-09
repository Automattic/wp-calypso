/**
 * External dependencies
 */
import debugModule from 'debug';
import pick from 'lodash/pick';
import throttle from 'lodash/throttle';

/**
 * Internal dependencies
 */
import { createReduxStore, reducer } from 'state';
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
const MINUTE_IN_MS = 1000 * 60;
export const SERIALIZE_THROTTLE = MINUTE_IN_MS;
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
	return JSON.stringify( Object.assign( serializedState, { _timestamp: Date.now() } ) );
}

function deserialize( state ) {
	const stateObj = JSON.parse( state );
	delete stateObj._timestamp;
	return reducer( stateObj, { type: DESERIALIZE } );
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

export function persistOnChange( reduxStore, serializeState = serialize ) {
	let lastState;

	function save() {

		console.log( 'saving redux tree' );
		const nextState = reduxStore.getState();
		if ( lastState && nextState === lastState ) {
			console.log( 'skipped, no changes' );
			return;
		}

		console.profile( 'save-state' );

		lastState = nextState;

		console.time( 'serialize-state' );
		const serializedState = serializeState( lastState );
		console.log( 'serializing %s bytes', ( serializedState.length * 2 ).toLocaleString() ); // times two because js uses wide chars
		console.timeEnd( 'serialize-state' );

		console.time( 'serialize-save' );
		console.time( 'serialize-set' );
		const setPromise = localforage.setItem( 'redux-state', serializedState )
			.then( () => {
				console.timeEnd( 'serialize-save' );
				console.profileEnd( 'save-state' );
			} )
			.catch( ( setError ) => {
				debug( 'failed to set redux-store state', setError );
			} );
		console.timeEnd( 'serialize-set' );
		return setPromise;
	}

	let saver = save;
	if ( global.requestIdleCallback ) {
		let saveScheduled;
		saver = () => {
			if ( saveScheduled ) {
				console.log( 'save scheduled with ric, skipping' );
				return;
			}
			saveScheduled = true;
			global.requestIdleCallback( ( deadline ) => {
				console.log( 'i have %d to live', deadline.timeRemaining() );
				save().then(
					() => { saveScheduled = false; },
					() => { saveScheduled = false; }
				);
				console.log( 'done with %d to live', deadline.timeRemaining() );
			}, { timeout: 5000 } );
		};
	}

	reduxStore.subscribe( throttle( saver, SERIALIZE_THROTTLE, { leading: false, trailing: true } ) );

	return reduxStore;
}

export default function createReduxStoreFromPersistedInitialState( reduxStoreReady ) {
	if ( config.isEnabled( 'persist-redux' ) && ! isSupportUserSession() ) {
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
