import { translate } from 'i18n-calypso';
import wpcom from 'calypso/lib/wp';
import {
	KEYRING_CONNECTION_DELETE,
	KEYRING_CONNECTION_DELETE_FAILURE,
	KEYRING_CONNECTIONS_RECEIVE,
	KEYRING_CONNECTIONS_REQUEST,
	KEYRING_CONNECTIONS_REQUEST_FAILURE,
	KEYRING_CONNECTIONS_REQUEST_SUCCESS,
	P2_CONNECTIONS_RECEIVE,
	P2_CONNECTIONS_REQUEST,
	P2_CONNECTIONS_REQUEST_FAILURE,
	P2_CONNECTIONS_REQUEST_SUCCESS,
	P2_CONNECTION_DELETE,
	P2_CONNECTION_DELETE_FAILURE,
} from 'calypso/state/action-types';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

import 'calypso/state/sharing/init';

/**
 * Triggers a network request for a user's connected services.
 *
 * @param {boolean} forceExternalUsersRefetch Whether to force refetching of external users
 * @returns {Function} Action thunk
 */
export function requestKeyringConnections( forceExternalUsersRefetch = false ) {
	return ( dispatch ) => {
		dispatch( {
			type: KEYRING_CONNECTIONS_REQUEST,
		} );

		return wpcom.req
			.get(
				{ path: '/me/connections', apiNamespace: 'wpcom/v2' },
				forceExternalUsersRefetch ? { force_external_users_refetch: forceExternalUsersRefetch } : {}
			)
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
 * @param  {Object}   connection Keyring connection to be removed.
 * @returns {Function}            Action thunk
 */
export function deleteKeyringConnection( connection ) {
	return {
		type: KEYRING_CONNECTION_DELETE,
		connection,
	};
}

/**
 * Returns an action object to be used to render a connection deletion success notice.
 *
 * @param  {Object} connection Connection that was deleted.
 * @returns {Object}            Action object
 */
function deleteKeyringConnectionSuccess( connection ) {
	return successNotice(
		translate( 'The %(service)s account was successfully disconnected.', {
			args: { service: connection.label },
			context: 'Sharing: Publicize connection confirmation',
		} ),
		{ id: 'publicize' }
	);
}

/**
 * Triggers a network request to delete a Keyring connection from the server-side.
 *
 * @param  {Object} connection         Connection to be deleted.
 * @param  {number} connection.ID      ID of the connection to be deleted.
 * @param  {string} connection.label   Name of the service that was connected.
 * @returns {Function}                  Action thunk
 */
export function deleteStoredKeyringConnection( connection ) {
	return ( dispatch ) =>
		wpcom.req
			.get( {
				path: `/me/connections/${ connection.ID }`,
				apiNamespace: 'wpcom/v2',
				method: 'DELETE',
			} )
			.then( () => {
				dispatch( deleteKeyringConnection( connection ) );
				dispatch( deleteKeyringConnectionSuccess( connection ) );
			} )
			.catch( ( error ) => {
				if ( error && 404 === error.statusCode ) {
					// If the connection cannot be found, we infer that it must have been deleted since the original
					// connections were retrieved, so pass along the cached connection.
					dispatch( deleteKeyringConnection( connection ) );
					dispatch( deleteKeyringConnectionSuccess( connection ) );
				}

				dispatch( {
					type: KEYRING_CONNECTION_DELETE_FAILURE,
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
 * Triggers a network request for a P2's connected services.
 *
 * @param {number} hubId P2 hub identifier
 * @returns {Function} Action thunk
 */
export function requestP2KeyringConnections( hubId ) {
	return ( dispatch ) => {
		dispatch( {
			type: P2_CONNECTIONS_REQUEST,
		} );

		return wpcom.req
			.get( { path: '/p2/connections/items', apiNamespace: 'wpcom/v2' }, { hub_id: hubId } )
			.then( ( { connections } ) => {
				dispatch( {
					type: P2_CONNECTIONS_RECEIVE,
					connections,
				} );
				dispatch( {
					type: P2_CONNECTIONS_REQUEST_SUCCESS,
				} );
			} )
			.catch( ( error ) =>
				dispatch( {
					type: P2_CONNECTIONS_REQUEST_FAILURE,
					error,
				} )
			);
	};
}

/**
 * Triggers a network request to delete a P2 Keyring connection from the server-side.
 *
 * @param  {Object} connection         Connection to be deleted.
 * @param  {number} connection.ID      ID of the connection to be deleted.
 * @param  {string} connection.label   Name of the service that was connected.
 * @param  {number} siteId             Selected site id.
 * @returns {Function}                 Action thunk
 */
export function deleteP2KeyringConnection( connection, siteId ) {
	return ( dispatch ) =>
		wpcom.req
			.get(
				{
					path: `/p2/connections/items/${ connection.ID }`,
					apiNamespace: 'wpcom/v2',
					method: 'DELETE',
				},
				{ hub_id: siteId }
			)
			.then( () => {
				dispatch( {
					type: P2_CONNECTION_DELETE,
					connection,
				} );
				dispatch( deleteKeyringConnectionSuccess( connection ) );
			} )
			.catch( ( error ) => {
				if ( error && 404 === error.statusCode ) {
					// If the connection cannot be found, we infer that it must have been deleted since the original
					// connections were retrieved, so pass along the cached connection.
					dispatch( {
						type: P2_CONNECTION_DELETE,
						connection,
					} );
					dispatch( deleteKeyringConnectionSuccess( connection ) );
				}

				dispatch( {
					type: P2_CONNECTION_DELETE_FAILURE,
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
