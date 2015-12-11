/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	FETCH_PUBLICIZE_CONNECTIONS,
	RECEIVE_PUBLICIZE_CONNECTIONS,
	FAIL_PUBLICIZE_CONNECTIONS_REQUEST
} from 'state/action-types';

/**
 * Triggers a network request to fetch Publicize connections for the specified
 * site ID.
 *
 * @param  {Number}   siteId Site ID
 * @return {Function}        Action thunk
 */
export function fetchConnections( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: FETCH_PUBLICIZE_CONNECTIONS,
			siteId
		} );

		return new Promise( ( resolve ) => {
			wpcom.undocumented().siteConnections( siteId, ( error, data ) => {
				if ( error ) {
					dispatch( failConnectionsRequest( siteId, error ) );
				} else {
					dispatch( receiveConnections( siteId, data ) );
				}

				resolve();
			} );
		} );
	};
}

/**
 * Returns an action object to be used in signalling that a network request for
 * Publicize connections has been received.
 *
 * @param  {Number} siteId Site ID
 * @param  {Object} data   API response
 * @return {Object}        Action object
 */
export function receiveConnections( siteId, data ) {
	return {
		type: RECEIVE_PUBLICIZE_CONNECTIONS,
		siteId,
		data
	};
}

/**
 * Returns an action object to be used in signalling that a network request for
 * Publicize connections has failed.
 *
 * @param  {Number} siteId Site ID
 * @param  {Object} error  API response error
 * @return {Object}        Action object
 */
export function failConnectionsRequest( siteId, error ) {
	return {
		type: FAIL_PUBLICIZE_CONNECTIONS_REQUEST,
		siteId,
		error
	};
}
