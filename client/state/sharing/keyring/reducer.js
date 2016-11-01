/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { keyBy, without } from 'lodash';

/**
 * Internal dependencies
 */
import {
	KEYRING_CONNECTIONS_RECEIVE,
	KEYRING_CONNECTIONS_REQUEST,
	KEYRING_CONNECTIONS_REQUEST_FAILURE,
	KEYRING_CONNECTIONS_REQUEST_SUCCESS,
	PUBLICIZE_CONNECTION_CREATE,
	PUBLICIZE_CONNECTION_DELETE,
} from 'state/action-types';
import { itemSchema } from './schema';
import { createReducer } from 'state/utils';

// Tracks fetching state for keyring connections
export const isFetching = createReducer( false, {
	[ KEYRING_CONNECTIONS_REQUEST ]: () => true,
	[ KEYRING_CONNECTIONS_REQUEST_SUCCESS ]: () => false,
	[ KEYRING_CONNECTIONS_REQUEST_FAILURE ]: () => false,
} );

// Stores the list of available keyring connections
export const items = createReducer( {}, {
	[ KEYRING_CONNECTIONS_RECEIVE ]: ( state, { connections } ) => ( { ...keyBy( connections, 'ID' ) } ),
	[ PUBLICIZE_CONNECTION_CREATE ]: ( state, { connection: { keyring_connection_ID: id, site_ID } } ) => {
		const connection = state[ id ];
		const sites = [ ...connection.sites, site_ID.toString() ];

		return { ...state, [ id ]: { ...connection, sites } };
	},
	[ PUBLICIZE_CONNECTION_DELETE ]: ( state, { connection: { keyring_connection_ID: id, site_ID } } ) => {
		const connection = state[ id ];
		const sites = without( connection.sites, site_ID.toString() );

		return { ...state, [ id ]: { ...connection, sites } };
	},
}, itemSchema );

export default combineReducers( {
	isFetching,
	items,
} );
