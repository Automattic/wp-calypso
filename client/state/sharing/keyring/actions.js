/**
 * Internal dependencies
 */

import wpcom from 'lib/wp';
import {
	KEYRING_CONNECTION_DELETE,
	KEYRING_CONNECTION_DELETE_FAILURE,
	KEYRING_CONNECTIONS_RECEIVE,
	KEYRING_CONNECTIONS_REQUEST,
	KEYRING_CONNECTIONS_REQUEST_FAILURE,
	KEYRING_CONNECTIONS_REQUEST_SUCCESS,
} from 'state/action-types';

/**
 * Triggers a network request for a user's connected services.
 *
 * @returns {Function} Action thunk
 */
export function requestKeyringConnections( forceExternalUsersRefetch = false ) {
	return ( dispatch ) => {
		dispatch( {
			type: KEYRING_CONNECTIONS_REQUEST,
		} );

		return wpcom
			.undocumented()
			.mekeyringConnections( forceExternalUsersRefetch )
			.then( ( { connections } ) => {
				dispatch( {
					type: KEYRING_CONNECTIONS_RECEIVE,
					connections,
				} );
				dispatch( {
					type: KEYRING_CONNECTIONS_REQUEST_SUCCESS,
				} );
			} )
			.catch( ( error ) =>
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
 * @param  {object}   connection Keyring connection to be removed.
 * @returns {Function}            Action thunk
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
 * @param  {object} connection         Connection to be deleted.
 * @param  {number} connection.ID      ID of the connection to be deleted.
 * @param  {string} connection.label   Name of the service that was connected.
 * @returns {Function}                  Action thunk
 */
export function deleteStoredKeyringConnection( connection ) {
	return ( dispatch ) =>
		wpcom
			.undocumented()
			.deletekeyringConnection( connection.ID )
			.then( () => dispatch( deleteKeyringConnection( connection ) ) )
			.catch( ( error ) => {
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
