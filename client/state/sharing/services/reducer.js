/**
 * Internal dependencies
 */
import { itemSchema } from './schema';
import { KEYRING_SERVICES_RECEIVE, KEYRING_SERVICES_REQUEST, KEYRING_SERVICES_REQUEST_FAILURE, KEYRING_SERVICES_REQUEST_SUCCESS } from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';

// Stores the list of available keyring services
export const items = createReducer( {}, {
	[ KEYRING_SERVICES_RECEIVE ]: ( state, action ) => action.services,
}, itemSchema );

// Tracks fetching state for keyring services
export const isFetching = createReducer( false, {
	[ KEYRING_SERVICES_REQUEST ]: () => true,
	[ KEYRING_SERVICES_REQUEST_SUCCESS ]: () => false,
	[ KEYRING_SERVICES_REQUEST_FAILURE ]: () => false
} );

export default combineReducers( {
	isFetching,
	items,
} );
