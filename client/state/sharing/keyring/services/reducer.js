/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	KEYRING_SERVICES_RECEIVE,
	KEYRING_SERVICES_REQUEST,
	KEYRING_SERVICES_REQUEST_FAILURE,
	KEYRING_SERVICES_REQUEST_SUCCESS,
} from 'state/action-types';
import { itemSchema } from './schema';
import { createReducer } from 'state/utils';

// Stores the complete list of states, indexed by locale key
export const items = createReducer( {}, {
	[ KEYRING_SERVICES_RECEIVE ]: ( state, action ) => action.services,
}, itemSchema );

// Tracks states list fetching state
export const isFetching = createReducer( false, {
	[ KEYRING_SERVICES_REQUEST ]: () => true,
	[ KEYRING_SERVICES_REQUEST_SUCCESS ]: () => false,
	[ KEYRING_SERVICES_REQUEST_FAILURE ]: () => false
} );

export default combineReducers( {
	isFetching,
	items,
} );
