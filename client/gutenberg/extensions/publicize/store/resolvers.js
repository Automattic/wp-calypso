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
	try {
		const connections = yield fetchFromAPI( getFetchConnectionsPath( postId ) );
		yield setConnections( postId, connections );
	} catch ( error ) {
		// Fetching connections failed
	}
};

/**
 * Requests the Publicize services available for connection.
 */
export function* getServices() {
	try {
		const services = yield fetchFromAPI( '/jetpack/v4/publicize/services' );
		yield setServices( services );
	} catch ( error ) {
		// Fetching available services failed
	}
};
