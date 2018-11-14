/** @format */

/**
 * Internal dependencies
 */
import { getFetchConnectionsPath } from './utils';

/**
 * Returns an action object used in signalling that
 * we're setting the Publicize connections for a post.
 *
 * @param {Number} postId      ID of the post.
 * @param {Array}  connections List of connections.
 *
 * @return {Object} Action object.
 */
export function setConnections( postId, connections ) {
	return {
		type: 'SET_CONNECTIONS',
		connections,
		postId,
	};
}

/**
 * Requests the Publicize connections for a post by its ID.
 *
 * @param {Number} postId      ID of the post.
 *
 * @return {Object} Action object.
 */
export function* refreshConnections( postId ) {
	try {
		const connections = yield fetchFromAPI( getFetchConnectionsPath( postId ) );
		return setConnections( postId, connections.jetpack_publicize_connections );
	} catch ( error ) {
		// Refreshing connections failed
	}
}

/**
 * Returns an action object used in signalling that
 * we're initiating a fetch request to the REST API.
 *
 * @param {String} path API endpoint path.
 *
 * @return {Object} Action object.
 */
export function fetchFromAPI( path ) {
	return {
		type: 'FETCH_FROM_API',
		path,
	};
}
