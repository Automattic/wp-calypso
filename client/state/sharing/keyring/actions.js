/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	KEYRING_CONNECTION_DELETE,
	KEYRING_CONNECTIONS_RECEIVE,
	KEYRING_CONNECTIONS_REQUEST,
	KEYRING_CONNECTIONS_REQUEST_FAILURE,
	KEYRING_CONNECTIONS_REQUEST_SUCCESS,
} from 'state/action-types';

/**
 * Triggers a network request for a user's connected services.
 *
 * @return {Function} Action thunk
 */
export function requestKeyringConnections() {
	return ( dispatch ) => {
		dispatch( {
			type: KEYRING_CONNECTIONS_REQUEST,
		} );

		return wpcom.undocumented().mekeyringConnections()
			.then( ( { connections } ) => {
				dispatch( {
					type: KEYRING_CONNECTIONS_RECEIVE,
					connections,
				} );
				dispatch( {
					type: KEYRING_CONNECTIONS_REQUEST_SUCCESS,
				} );
			} )
			.catch( ( error ) => dispatch( {
				type: KEYRING_CONNECTIONS_REQUEST_FAILURE,
				error,
			} ) );
	};
}

/**
 * Triggers an action to delete a Keyring connection.
 *
 * @param  {Object}   connection Keyring connection to be removed.
 * @return {Function}            Action thunk
 */
export const deleteKeyringConnection = ( connection ) => ( dispatch ) => dispatch( {
	type: KEYRING_CONNECTION_DELETE,
	connection,
} );
