/**
 * External dependencies
 */
import filter from 'lodash/filter';
import get from 'lodash/get';

/**
 * Returns an array of known connections for the given site ID.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @return {Array}         Site connections
 */
export function getConnectionsBySiteId( state, siteId ) {
	return filter( state.sharing.publicize.connections, { site_ID: siteId } );
}

/**
 * Returns an array of known connections for the given site ID
 * that are available to the specified user ID.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @param  {Number} userId User ID to filter
 * @return {Array}         User connections
 */
export function getSiteUserConnections( state, siteId, userId ) {
	return filter( state.sharing.publicize.connections, ( connection ) => {
		const { site_ID, shared, keyring_connection_user_ID } = connection;
		return site_ID === siteId && ( shared || keyring_connection_user_ID === userId );
	} );
}

/**
 * Returns an array of known connections for the given site ID
 * that are available to the specified user ID.
 *
 * @param  {Object} state   Global state tree
 * @param  {Number} siteId  Site ID
 * @param  {Number} userId  User ID to filter
 * @param  {String} service The name of the service to check
 * @return {Array}          User connections
 */
export function getSiteUserConnectionsForService( state, siteId, userId, service ) {
	return filter( getSiteUserConnections( state, siteId, userId ), { service } );
}

/**
 * Returns true if connections have been fetched for the given site ID.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @return {Array}         Site connections
 */
export function hasFetchedConnections( state, siteId ) {
	const { fetchingConnections } = state.sharing.publicize;
	return fetchingConnections.hasOwnProperty( siteId );
}

/**
 * Returns true if connections are currently fetching for the given site ID.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @return {Array}         Site connections
 */
export function isFetchingConnections( state, siteId ) {
	const { fetchingConnections } = state.sharing.publicize;
	return hasFetchedConnections( state, siteId ) && fetchingConnections[ siteId ];
}


export function isRequestingSharePost( state, siteId, postId ) {
	return get( state.sharing.publicize.sharePostStatus, [ siteId , postId, 'requesting' ], false );
}

export function sharePostSuccessMessage( state, siteId, postId ) {
	return get( state.sharing.publicize.sharePostStatus, [ siteId , postId, 'success' ], false );
}

export function sharePostFailure( state, siteId, postId ) {
	return ( get( state.sharing.publicize.sharePostStatus, [ siteId , postId, 'error' ], false ) === true );
}
