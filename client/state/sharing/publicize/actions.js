/**
 * Internal dependencies
 */
import {
	PUBLICIZE_CONNECTIONS_REQUEST,
	PUBLICIZE_CONNECTIONS_RECEIVE,
	PUBLICIZE_CONNECTIONS_REQUEST_FAILURE,
	PUBLICIZE_SHARE,
	PUBLICIZE_SHARE_SUCCESS,
	PUBLICIZE_SHARE_FAILURE,
	PUBLICIZE_SHARE_DISMISS
} from 'state/action-types';

export function dismissShareConfirmation( siteId, postId ) {
	return {
		type: PUBLICIZE_SHARE_DISMISS,
		siteId,
		postId,
	}
}

export function sharePost( siteId, postId, skippedConnections, message ) {
	return ( dispatch ) => {
		dispatch( {
			type: PUBLICIZE_SHARE,
			siteId,
			postId,
			skippedConnections,
			message
		} );

		return new Promise( ( resolve ) => {
			wpcom.undocumented().publicizePost( siteId, postId, message, skippedConnections, ( error, data ) => {
				if ( error || ! data.success ) {
					dispatch( { type: PUBLICIZE_SHARE_FAILURE, siteId, postId, error } );
				} else {
					dispatch( { type: PUBLICIZE_SHARE_SUCCESS, siteId, postId } );
				}

				resolve();
			} );
		} );
	};
}

/**
 * Triggers a network request to fetch Publicize connections for the specified
 * site ID.
 *
 * @param  {Number}   siteId Site ID
 * @return {Object}          Action object
 */
export const fetchConnections = ( siteId ) =>  ( {
	type: PUBLICIZE_CONNECTIONS_REQUEST,
	siteId
} );

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
