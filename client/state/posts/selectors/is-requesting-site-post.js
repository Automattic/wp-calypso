/**
 * Internal dependencies
 */
import 'calypso/state/posts/init';

/**
 * Returns true if a request is in progress for the specified site post, or
 * false otherwise.
 *
 * @param   {object}  state  Global state tree
 * @param   {number}  siteId Site ID
 * @param   {number}  postId Post ID
 * @returns {boolean}        Whether request is in progress
 */
export function isRequestingSitePost( state, siteId, postId ) {
	if ( ! siteId ) {
		return null;
	}

	if ( ! state.posts.siteRequests[ siteId ] ) {
		return false;
	}

	return !! state.posts.siteRequests[ siteId ][ postId ];
}
