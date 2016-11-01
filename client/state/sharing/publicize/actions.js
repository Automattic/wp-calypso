/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	PUBLICIZE_CONNECTION_CREATE,
	PUBLICIZE_CONNECTION_CREATE_FAILURE,
	PUBLICIZE_CONNECTION_DELETE,
	PUBLICIZE_CONNECTION_DELETE_FAILURE,
	PUBLICIZE_CONNECTION_UPDATE,
	PUBLICIZE_CONNECTION_UPDATE_FAILURE,
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
	};
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
 * @return {Function}        Action thunk
 */
export function fetchConnections( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: PUBLICIZE_CONNECTIONS_REQUEST,
			siteId,
		} );

		return wpcom.undocumented().siteConnections( siteId )
			.then( ( response ) => dispatch( receiveConnections( siteId, response ) ) )
			.catch( ( error ) => dispatch( failConnectionsRequest( siteId, error ) ) );
	};
}

/**
 * Given a service and optional site, establishes a new connection to the
 * service for the current user.
 *
 * @param {Number} siteId              Site ID
 * @param {Number} keyringConnectionId Keyring connection ID
 * @param {Number} externalUserId      An optional external user ID to create a connection to an external user account.
 * @return {Function}                  Action thunk
 */
export function createSiteConnection( siteId, keyringConnectionId, externalUserId ) {
	return ( dispatch ) =>
		wpcom.undocumented().createConnection( keyringConnectionId, siteId, externalUserId, { shared: false } )
			.then( ( connection ) => dispatch( {
				type: PUBLICIZE_CONNECTION_CREATE,
				connection,
			} ) )
			.catch( ( error ) => dispatch( {
				type: PUBLICIZE_CONNECTION_CREATE_FAILURE,
				error,
			} ) );
}

/**
 * Triggers a network request to update a Publicize connection for a specific site.
 *
 * @param  {Number} siteId       Site ID for which the connection is deleted.
 * @param  {Number} connectionId ID of the connection to be deleted.
 * @param  {Object} attributes   The update request body.
 * @return {Function}            Action thunk
 */
export function updateSiteConnection( siteId, connectionId, attributes ) {
	return ( dispatch ) =>
		wpcom.undocumented().updateConnection( siteId, connectionId, attributes )
			.then( ( connection ) => dispatch( {
				type: PUBLICIZE_CONNECTION_UPDATE,
				connection,
			} ) )
			.catch( ( error ) => dispatch( {
				type: PUBLICIZE_CONNECTION_UPDATE_FAILURE,
				error,
			} ) );
}

/**
 * Triggers a network request to delete a Publicize connection for a specific site.
 *
 * @param  {Object} connection         Connection to be deleted.
 * @param  {Number} connection.site_ID Site ID for which the connection is deleted.
 * @param  {Number} connection.ID      ID of the connection to be deleted.
 * @return {Function}          Action thunk
 */
export function deleteSiteConnection( connection ) {
	return ( dispatch ) =>
		wpcom.undocumented().deleteSiteConnection( connection.site_ID, connection.ID )
			.then( () => dispatch( deleteConnection( connection ) ) )
			.catch( ( error ) => {
				if ( error && 404 === error.statusCode ) {
					// If the connection cannot be found, we infer that it must have been deleted since the original
					// connections were retrieved, so pass along the cached connection.
					dispatch( deleteConnection( connection ) );
				}

				dispatch( {
					type: PUBLICIZE_CONNECTION_DELETE_FAILURE,
					error,
				} );
			} );
}

/**
 * Returns an action object to be used in signalling that a network request for
 * removing a Publicize connection has been received.
 *
 * @param  {Object} connection         Connection to be deleted.
 * @param  {Number} connection.site_ID Site ID for which the connection is deleted.
 * @param  {Number} connection.ID      ID of the connection to be deleted.
 * @return {Object}                    Action object
 */
export function deleteConnection( connection ) {
	return {
		type: PUBLICIZE_CONNECTION_DELETE,
		connection,
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
