/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	PUBLICIZE_CONNECTIONS_REQUEST,
	PUBLICIZE_CONNECTIONS_RECEIVE,
	PUBLICIZE_CONNECTIONS_REQUEST_FAILURE
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
			type: PUBLICIZE_CONNECTIONS_REQUEST,
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
		type: PUBLICIZE_CONNECTIONS_RECEIVE,
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
		type: PUBLICIZE_CONNECTIONS_REQUEST_FAILURE,
		siteId,
		error
	};
}
