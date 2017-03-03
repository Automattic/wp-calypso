/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	DIRECTLY_INITIALIZED
} from 'state/action-types';
import { createReducer } from 'state/utils';

export const isInitialized = createReducer( false, {
	[ DIRECTLY_INITIALIZED ]: () => true,
} );

export const config = createReducer( null, {
	[ DIRECTLY_INITIALIZED ]: ( state, action ) => action.config,
} );

export default combineReducers( { isInitialized, config } );
