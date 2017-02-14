/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	DIRECTLY_INITIALIZING,
	DIRECTLY_INITIALIZED,
	DIRECTLY_INITIALIZATION_ERROR
} from 'state/action-types';
import { createReducer } from 'state/utils';

export const isInitializing = createReducer( false, {
	[ DIRECTLY_INITIALIZING ]: () => true,
	[ DIRECTLY_INITIALIZED ]: () => false,
	[ DIRECTLY_INITIALIZATION_ERROR ]: () => false,
} );

export const isReady = createReducer( false, {
	[ DIRECTLY_INITIALIZING ]: () => false,
	[ DIRECTLY_INITIALIZED ]: () => true,
	[ DIRECTLY_INITIALIZATION_ERROR ]: () => false,
} );

export const error = createReducer( null, {
	[ DIRECTLY_INITIALIZING ]: () => null,
	[ DIRECTLY_INITIALIZED ]: () => null,
	[ DIRECTLY_INITIALIZATION_ERROR ]: ( state, action ) => action.error,
} );

export const config = createReducer( null, {
	[ DIRECTLY_INITIALIZING ]: ( state, action ) => action.config,
} );

export default combineReducers( { isInitializing, isReady, error, config } );
