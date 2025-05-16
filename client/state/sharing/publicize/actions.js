import { translate } from 'i18n-calypso';
import wpcom from 'calypso/lib/wp';
import {
	PUBLICIZE_CONNECTION_CREATE,
	PUBLICIZE_CONNECTION_DELETE,
	PUBLICIZE_CONNECTION_DELETE_FAILURE,
	PUBLICIZE_CONNECTION_RECEIVE,
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
} from 'calypso/state/action-types';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

import 'calypso/state/sharing/init';

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

		const body = {
			skipped_connections: skippedConnections ?? [],
			message,
		};

		wpcom.req
			.post( {
				path: `/sites/${ siteId }/posts/${ postId }/publicize`,
				body,
				apiNamespace: 'wpcom/v2',
			} )
			// Note: successes are recorded in data.results, errors are recorded in data.errors. There could be
			// several errors and several successes.
			.then( ( data ) => {
				if ( ! data.results.length ) {
					dispatch( { type: PUBLICIZE_SHARE_FAILURE, siteId, postId } );
				} else {
					dispatch( { type: PUBLICIZE_SHARE_SUCCESS, siteId, postId } );
				}
			} )
			.catch( () => {
				dispatch( { type: PUBLICIZE_SHARE_FAILURE, siteId, postId } );
			} );
	};
}

/**
 * Triggers a network request to fetch Publicize connections for the specified
 * site ID.
 * @param  {number}   siteId Site ID
 * @returns {Function}        Action thunk
 */
export function fetchConnections( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: PUBLICIZE_CONNECTIONS_REQUEST,
			siteId,
		} );

		return wpcom.req
			.get( `/sites/${ siteId }/publicize-connections` )
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
 * @param  {number} siteId       Site ID
 * @param  {number} connectionId ID of the connection to be fetched.
 * @returns {Function}            Action thunk
 */
export function fetchConnection( siteId, connectionId ) {
	return ( dispatch ) =>
		wpcom.req
			.get( `/sites/${ siteId }/publicize-connections/${ connectionId }` )
			.then( ( connection ) => {
				dispatch( {
					type: PUBLICIZE_CONNECTION_RECEIVE,
					connection,
					siteId,
				} );
			} )
			.catch( () => {} );
}

/**
 * Given a service and optional site, establishes a new connection to the
 * service for the current user.
 * @param {number} siteId              Site ID
 * @param {number} keyringConnectionId Keyring connection ID
 * @param {number} externalUserId      An optional external user ID to create a connection to an external user account.
 * @returns {Function}                  Action thunk
 */
export function createSiteConnection( siteId, keyringConnectionId, externalUserId ) {
	return ( dispatch ) => {
		const body = {
			keyring_connection_ID: keyringConnectionId,
			shared: false,
		};

		if ( externalUserId ) {
			body.external_user_ID = externalUserId;
		}

		return wpcom.req
			.post( `/sites/${ siteId }/publicize-connections/new`, body )
			.then( ( connection ) => {
				dispatch( {
					type: PUBLICIZE_CONNECTION_CREATE,
					connection,
				} );
				dispatch(
					successNotice(
						translate( 'The %(service)s account was successfully connected.', {
							args: { service: connection.label },
							context: 'Sharing: Publicize connection confirmation',
						} ),
						{ id: 'publicize' }
					)
				);
			} )
			.catch( ( error ) => {
				dispatch(
					errorNotice(
						error.message ||
							translate( 'An error occurred while connecting the account.', {
								context: 'Sharing: Publicize connection confirmation',
							} ),
						{ id: 'publicize' }
					)
				);
			} );
	};
}

/**
 * Triggers a network request to update a Publicize connection for a specific site.
 * @param  {Object} connection         Connection to be updated.
 * @param  {number} connection.site_ID Site ID for which the connection is updated.
 * @param  {number} connection.ID      ID of the connection to be updated.
 * @param  {string} connection.label   Name of the connected service.
 * @param  {Object} attributes         The update request body.
 * @returns {Function}                  Action thunk
 */
export function updateSiteConnection( connection, attributes ) {
	return ( dispatch ) =>
		wpcom.req
			.post( `/sites/${ connection.site_ID }/publicize-connections/${ connection.ID }`, attributes )
			.then( ( response ) => {
				dispatch( {
					type: PUBLICIZE_CONNECTION_UPDATE,
					connection: response,
				} );

				dispatch(
					successNotice(
						translate( 'The %(service)s account was successfully updated.', {
							args: { service: connection.label },
							context: 'Sharing: Publicize connection confirmation',
						} ),
						{ id: 'publicize' }
					)
				);
			} )
			.catch( ( error ) => {
				dispatch( {
					type: PUBLICIZE_CONNECTION_UPDATE_FAILURE,
					error: { ...error, label: connection.label },
				} );

				dispatch(
					errorNotice(
						translate( 'The %(service)s account was unable to be updated.', {
							args: { service: error.label },
							context: 'Sharing: Publicize reconnection confirmation',
						} ),
						{ id: 'publicize' }
					)
				);
			} );
}

/**
 * Triggers a network request to delete a Publicize connection for a specific site.
 * @param  {Object} connection         Connection to be deleted.
 * @param  {number} connection.site_ID Site ID for which the connection is deleted.
 * @param  {number} connection.ID      ID of the connection to be deleted.
 * @param  {string} connection.label   Name of the service that was connected.
 * @returns {Function}                  Action thunk
 */
export function deleteSiteConnection( connection ) {
	return ( dispatch ) =>
		wpcom.req
			.post( `/sites/${ connection.site_ID }/publicize-connections/${ connection.ID }/delete` )
			.then( () => {
				dispatch( deleteConnection( connection ) );
				dispatch( deleteConnectionSuccess( connection ) );
			} )
			.catch( ( error ) => {
				if ( error && 404 === error.statusCode ) {
					// If the connection cannot be found, we infer that it must have been deleted since the original
					// connections were retrieved, so pass along the cached connection.
					dispatch( deleteConnection( connection ) );
					dispatch( deleteConnectionSuccess( connection ) );
				}

				dispatch( {
					type: PUBLICIZE_CONNECTION_DELETE_FAILURE,
					error: { ...error, label: connection.label },
				} );

				dispatch(
					errorNotice(
						translate( 'The %(service)s account was unable to be disconnected.', {
							args: { service: error.label },
							context: 'Sharing: Publicize connection confirmation',
						} ),
						{ id: 'publicize' }
					)
				);
			} );
}

/**
 * Returns an action object to be used in signalling that a network request for
 * removing a Publicize connection has been received.
 * @param  {Object} connection Connection to be deleted.
 * @returns {Object}            Action object
 */
export function deleteConnection( connection ) {
	return {
		type: PUBLICIZE_CONNECTION_DELETE,
		connection,
	};
}

/**
 * Returns an action object to be used to render a connection deletion success notice.
 * @param  {Object} connection Connection that was deleted.
 * @returns {Object}            Action object
 */
function deleteConnectionSuccess( connection ) {
	return successNotice(
		translate( 'The %(service)s account was successfully disconnected.', {
			args: { service: connection.label },
			context: 'Sharing: Publicize connection confirmation',
		} ),
		{ id: 'publicize' }
	);
}

/**
 * Returns an action object to be used in signalling that a network request for
 * Publicize connections has been received.
 * @param  {number} siteId Site ID
 * @param  {Object} data   API response
 * @returns {Object}        Action object
 */
export function receiveConnections( siteId, data ) {
	return {
		type: PUBLICIZE_CONNECTIONS_RECEIVE,
		siteId,
		data,
	};
}
