/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import { getFetchConnectionsPath } from './utils';
import { setConnections } from './actions';

/**
 * Effect handler which will refresh the connections for a post.
 * Internally, it will trigger a fetch the post's connections, and after they
 * are loaded, they will be updated for the specified post.
 *
 * @param {Object} action Action which had initiated the effect handler.
 * @param {Object} store  Store instance.
 *
 * @return {Object} Set connections action.
 */
export async function refreshConnections( action, store ) {
	const { dispatch } = store;

	const connections = await apiFetch( { path: getFetchConnectionsPath( action.postId ) } );

	return dispatch( setConnections( action.postId, connections ) );
}

export default {
	REFRESH_CONNECTIONS: refreshConnections,
};
