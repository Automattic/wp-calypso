/**
 * Internal dependencies
 */
import {
	KEYRING_SERVICES_RECEIVE,
	KEYRING_SERVICES_REQUEST,
	KEYRING_SERVICES_REQUEST_FAILURE,
	KEYRING_SERVICES_REQUEST_SUCCESS,
} from 'state/action-types';
import { combineReducersWithPersistence, createReducer } from 'state/utils';
import { itemSchema } from './schema';

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

export default combineReducersWithPersistence( {
	isFetching,
	items,
} );
