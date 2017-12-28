/** @format */

/**
 * Internal dependencies
 */

import wpcom from 'client/lib/wp';
import {
	KEYRING_CONNECTION_DELETE,
	KEYRING_CONNECTION_DELETE_FAILURE,
	KEYRING_CONNECTIONS_RECEIVE,
	KEYRING_CONNECTIONS_REQUEST,
	KEYRING_CONNECTIONS_REQUEST_FAILURE,
	KEYRING_CONNECTIONS_REQUEST_SUCCESS,
} from 'client/state/action-types';

/**
 * Triggers a network request for a user's connected services.
 *
 * @return {Function} Action thunk
 */
export function requestKeyringConnections() {
	return dispatch => {
		dispatch( {
			type: KEYRING_CONNECTIONS_REQUEST,
		} );

		return wpcom
			.undocumented()
			.mekeyringConnections()
			.then( ( { connections } ) => {
				dispatch( {
					type: KEYRING_CONNECTIONS_RECEIVE,
					connections,
				} );
				dispatch( {
					type: KEYRING_CONNECTIONS_REQUEST_SUCCESS,
				} );
			} )
			.catch( error =>
				dispatch( {
					type: KEYRING_CONNECTIONS_REQUEST_FAILURE,
					error,
				} )
			);
	};
}

/**
 * Triggers an action to delete a Keyring connection.
 *
 * @param  {Object}   connection Keyring connection to be removed.
 * @return {Function}            Action thunk
 */
export function deleteKeyringConnection( connection ) {
	return {
		type: KEYRING_CONNECTION_DELETE,
		connection,
	};
}

/**
 * Triggers a network request to delete a Keyring connection from the server-side.
 *
 * @param  {Object} connection         Connection to be deleted.
 * @param  {Number} connection.ID      ID of the connection to be deleted.
 * @param  {String} connection.label   Name of the service that was connected.
 * @return {Function}                  Action thunk
 */
export function deleteStoredKeyringConnection( connection ) {
	return dispatch =>
		wpcom
			.undocumented()
			.deletekeyringConnection( connection.ID )
			.then( () => dispatch( deleteKeyringConnection( connection ) ) )
			.catch( error => {
				if ( error && 404 === error.statusCode ) {
					// If the connection cannot be found, we infer that it must have been deleted since the original
					// connections were retrieved, so pass along the cached connection.
					dispatch( deleteKeyringConnection( connection ) );
				}

				dispatch( {
					type: KEYRING_CONNECTION_DELETE_FAILURE,
					error: { ...error, label: connection.label },
				} );
			} );
}
