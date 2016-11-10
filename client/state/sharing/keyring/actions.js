/**
 * External dependencies
 */
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	KEYRING_CONNECTIONS_RECEIVE,
	KEYRING_CONNECTIONS_REQUEST,
	KEYRING_CONNECTIONS_REQUEST_FAILURE,
	KEYRING_CONNECTIONS_REQUEST_SUCCESS,
} from 'state/action-types';

/**
 * Triggers a network request for a user's connected services.
 *
 * @param {Function} successCallback Function that is called after a successful
 *                                   request. Default: _.identity.
 * @return {Function} Action thunk
 */
export function requestKeyringConnections( successCallback = identity ) {
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
			.then( successCallback )
			.catch( ( error ) => dispatch( {
				type: KEYRING_CONNECTIONS_REQUEST_FAILURE,
				error,
			} ) );
	};
}
