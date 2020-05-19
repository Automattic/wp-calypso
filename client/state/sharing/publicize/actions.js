/**
 * Internal dependencies
 */

import wpcom from 'lib/wp';
import {
	PUBLICIZE_CONNECTION_CREATE,
	PUBLICIZE_CONNECTION_CREATE_FAILURE,
	PUBLICIZE_CONNECTION_DELETE,
	PUBLICIZE_CONNECTION_DELETE_FAILURE,
	PUBLICIZE_CONNECTION_RECEIVE,
	PUBLICIZE_CONNECTION_REQUEST,
	PUBLICIZE_CONNECTION_REQUEST_FAILURE,
	PUBLICIZE_CONNECTION_REQUEST_SUCCESS,
	PUBLICIZE_CONNECTION_UPDATE,
	PUBLICIZE_CONNECTION_UPDATE_FAILURE,
	PUBLICIZE_CONNECTIONS_RECEIVE,
	PUBLICIZE_CONNECTIONS_REQUEST,
	PUBLICIZE_CONNECTIONS_REQUEST_FAILURE,
	PUBLICIZE_CONNECTIONS_REQUEST_SUCCESS,
	PUBLICIZE_SHARE,
	PUBLICIZE_SHARE_SUCCESS,
	PUBLICIZE_SHARE_FAILURE,
	PUBLICIZE_SHARE_DISMISS,
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
			message,
		} );

		return new Promise( ( resolve ) => {
			wpcom
				.undocumented()
				.publicizePost( siteId, postId, message, skippedConnections, ( error, data ) => {
					// Note: successes are recorded in data.results, errors are recorded in data.errors. There could be
					// several errors and several successes.
					if ( error || ! data.results ) {
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
 * @param  {number}   siteId Site ID
 * @returns {Function}        Action thunk
 */
export function fetchConnections( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: PUBLICIZE_CONNECTIONS_REQUEST,
			siteId,
		} );

		return wpcom
			.undocumented()
			.siteConnections( siteId )
			.then( ( connections ) => {
				dispatch( receiveConnections( siteId, connections ) );
				dispatch( {
					type: PUBLICIZE_CONNECTIONS_REQUEST_SUCCESS,
					siteId,
				} );
			} )
			.catch( ( error ) =>
				dispatch( {
					type: PUBLICIZE_CONNECTIONS_REQUEST_FAILURE,
					siteId,
					error,
				} )
			);
	};
}

/**
 * Triggers a network request to request a Publicize connection for the
 * specified site ID.
 *
 * @param  {number} siteId       Site ID
 * @param  {number} connectionId ID of the connection to be fetched.
 * @returns {Function}            Action thunk
 */
export function fetchConnection( siteId, connectionId ) {
	return ( dispatch ) => {
		dispatch( {
			type: PUBLICIZE_CONNECTION_REQUEST,
			connectionId,
			siteId,
		} );

		return wpcom
			.undocumented()
			.site( siteId )
			.getConnection( connectionId )
			.then( ( connection ) => {
				dispatch( {
					type: PUBLICIZE_CONNECTION_RECEIVE,
					connection,
					siteId,
				} );
				dispatch( {
					type: PUBLICIZE_CONNECTION_REQUEST_SUCCESS,
					connectionId,
					siteId,
				} );
			} )
			.catch( ( error ) =>
				dispatch( {
					type: PUBLICIZE_CONNECTION_REQUEST_FAILURE,
					connectionId,
					error,
					siteId,
				} )
			);
	};
}

/**
 * Given a service and optional site, establishes a new connection to the
 * service for the current user.
 *
 * @param {number} siteId              Site ID
 * @param {number} keyringConnectionId Keyring connection ID
 * @param {number} externalUserId      An optional external user ID to create a connection to an external user account.
 * @returns {Function}                  Action thunk
 */
export function createSiteConnection( siteId, keyringConnectionId, externalUserId ) {
	return ( dispatch ) =>
		wpcom
			.undocumented()
			.createConnection( keyringConnectionId, siteId, externalUserId, { shared: false } )
			.then( ( connection ) =>
				dispatch( {
					type: PUBLICIZE_CONNECTION_CREATE,
					connection,
				} )
			)
			.catch( ( error ) => dispatch( failCreateConnection( error ) ) );
}

/**
 * Triggers a network request to update a Publicize connection for a specific site.
 *
 * @param  {object} connection         Connection to be updated.
 * @param  {number} connection.site_ID Site ID for which the connection is updated.
 * @param  {number} connection.ID      ID of the connection to be updated.
 * @param  {string} connection.label   Name of the connected service.
 * @param  {object} attributes         The update request body.
 * @returns {Function}                  Action thunk
 */
export function updateSiteConnection( connection, attributes ) {
	return ( dispatch ) =>
		wpcom
			.undocumented()
			.updateConnection( connection.site_ID, connection.ID, attributes )
			.then( ( response ) =>
				dispatch( {
					type: PUBLICIZE_CONNECTION_UPDATE,
					connection: response,
				} )
			)
			.catch( ( error ) =>
				dispatch( {
					type: PUBLICIZE_CONNECTION_UPDATE_FAILURE,
					error: { ...error, label: connection.label },
				} )
			);
}

/**
 * Triggers a network request to delete a Publicize connection for a specific site.
 *
 * @param  {object} connection         Connection to be deleted.
 * @param  {number} connection.site_ID Site ID for which the connection is deleted.
 * @param  {number} connection.ID      ID of the connection to be deleted.
 * @param  {string} connection.label   Name of the service that was connected.
 * @returns {Function}                  Action thunk
 */
export function deleteSiteConnection( connection ) {
	return ( dispatch ) =>
		wpcom
			.undocumented()
			.deleteSiteConnection( connection.site_ID, connection.ID )
			.then( () => dispatch( deleteConnection( connection ) ) )
			.catch( ( error ) => {
				if ( error && 404 === error.statusCode ) {
					// If the connection cannot be found, we infer that it must have been deleted since the original
					// connections were retrieved, so pass along the cached connection.
					dispatch( deleteConnection( connection ) );
				}

				dispatch( {
					type: PUBLICIZE_CONNECTION_DELETE_FAILURE,
					error: { ...error, label: connection.label },
				} );
			} );
}

/**
 * Returns an action object to be used in signalling that creating a Publicize
 * connection has failed.
 *
 * @param  {object} error Error object
 * @returns {object}       Action object
 */
export function failCreateConnection( error ) {
	return {
		type: PUBLICIZE_CONNECTION_CREATE_FAILURE,
		error,
	};
}

/**
 * Returns an action object to be used in signalling that a network request for
 * removing a Publicize connection has been received.
 *
 * @param  {object} connection Connection to be deleted.
 * @returns {object}            Action object
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
 * @param  {number} siteId Site ID
 * @param  {object} data   API response
 * @returns {object}        Action object
 */
export function receiveConnections( siteId, data ) {
	return {
		type: PUBLICIZE_CONNECTIONS_RECEIVE,
		siteId,
		data,
	};
}
