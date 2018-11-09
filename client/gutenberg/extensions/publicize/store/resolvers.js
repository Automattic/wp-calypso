/**
 * Internal dependencies
 */
import { fetchFromAPI, setConnections } from './actions';
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
