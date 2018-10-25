/**
 * Internal dependencies
 */
import { fetchFromAPI, setConnections, setServices } from './actions';
import { getFetchConnectionsPath } from './utils';

/**
 * Requests the Publicize connections for a post by its ID.
 *
 * @param {Number} postId Post ID.
 */
export function* getConnections( postId ) {
	const connections = yield fetchFromAPI( getFetchConnectionsPath( postId ) );

	yield setConnections( postId, connections );
};

/**
 * Requests the Publicize services available for connection.
 */
export function* getServices() {
	const services = yield fetchFromAPI( '/jetpack/v4/publicize/services' );

	yield setServices( services );
};
