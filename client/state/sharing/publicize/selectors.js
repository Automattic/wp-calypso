/**
 * External dependencies
 */

import { filter, get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import canCurrentUser from 'state/selectors/can-current-user';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Returns an array of known connections for the given site ID.
 *
 * @param  {object} state  Global state tree
 * @param  {number} siteId Site ID
 * @returns {Array}         Site connections
 */
export function getConnectionsBySiteId( state, siteId ) {
	return filter( state.sharing.publicize.connections, { site_ID: siteId } );
}

/**
 * Returns an array of known connections for the given site ID
 * that are available to the specified user ID.
 *
 * @param  {object} state  Global state tree
 * @param  {number} siteId Site ID
 * @param  {number} userId User ID to filter
 * @returns {Array}         User connections
 */
export const getSiteUserConnections = createSelector(
	( state, siteId, userId ) =>
		filter(
			state.sharing.publicize.connections,
			( connection ) =>
				connection.site_ID === siteId &&
				( connection.shared || connection.keyring_connection_user_ID === userId )
		),
	( state ) => [ state.sharing.publicize.connections ]
);

/**
 * Returns an array of known connections for the given site ID
 * that are available to the specified user ID.
 *
 * @param  {object} state   Global state tree
 * @param  {number} siteId  Site ID
 * @param  {number} userId  User ID to filter
 * @param  {string} service The name of the service to check
 * @returns {Array}          User connections
 */
export function getSiteUserConnectionsForService( state, siteId, userId, service ) {
	return filter( getSiteUserConnections( state, siteId, userId ), { service } );
}

/**
 * Returns true when there are broken connections for the specified service.
 *
 * @param  {object} state   Global state tree
 * @param  {number} siteId  Site ID
 * @param  {number} userId  User ID to filter
 * @param  {string} service The name of the service to check
 * @returns {Array}          Broken user connections.
 */
export function getBrokenSiteUserConnectionsForService( state, siteId, userId, service ) {
	return filter( getSiteUserConnectionsForService( state, siteId, userId, service ), {
		status: 'broken',
	} );
}

/**
 * Given a service name, returns the connections that the current user is
 * allowed to remove.
 *
 * For them to be allowed to remove a connection they need to have either the
 * `edit_others_posts` capability or it's a connection to one of
 * their accounts.
 *
 * @param  {object} state   Global state tree
 * @param  {string} service The name of the service
 * @returns {Array}          Connections for which the current user is
 *                          permitted to remove.
 */
export function getRemovableConnections( state, service ) {
	const siteId = getSelectedSiteId( state );
	const userId = getCurrentUserId( state );
	const siteUserConnectionsForService = getSiteUserConnectionsForService(
		state,
		siteId,
		userId,
		service
	);

	if ( canCurrentUser( state, siteId, 'edit_others_posts' ) ) {
		return siteUserConnectionsForService;
	}

	return filter( siteUserConnectionsForService, { user_ID: userId } );
}

/**
 * Returns true if connections have been fetched for the given site ID.
 *
 * @param  {object} state  Global state tree
 * @param  {number} siteId Site ID
 * @returns {Array}         Site connections
 */
export function hasFetchedConnections( state, siteId ) {
	return get( state.sharing.publicize.fetchedConnections, [ siteId ], false );
}

/**
 * Returns true if connections are currently fetching for the given site ID.
 *
 * @param  {object} state  Global state tree
 * @param  {number} siteId Site ID
 * @returns {Array}         Site connections
 */
export function isFetchingConnections( state, siteId ) {
	return get( state.sharing.publicize.fetchingConnections, [ siteId ], false );
}

/**
 * Returns true if a connection is currently fetching for the given ID.
 *
 * @param  {object}  state        Global state tree
 * @param  {number}  connectionId Connection ID
 * @returns {boolean}              Whether the connection is being fetched.
 */
export function isFetchingConnection( state, connectionId ) {
	return state.sharing.publicize.fetchingConnection[ connectionId ] || false;
}

export function isRequestingSharePost( state, siteId, postId ) {
	return get( state.sharing.publicize.sharePostStatus, [ siteId, postId, 'requesting' ], false );
}

export function sharePostSuccessMessage( state, siteId, postId ) {
	return get( state.sharing.publicize.sharePostStatus, [ siteId, postId, 'success' ], false );
}

export function sharePostFailure( state, siteId, postId ) {
	return (
		get( state.sharing.publicize.sharePostStatus, [ siteId, postId, 'error' ], false ) === true
	);
}
