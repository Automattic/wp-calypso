/**
 * Internal dependencies
 */
import { POST_EDIT } from 'calypso/state/action-types';

import 'calypso/state/posts/init';

/**
 * Returns an action object to be used in signalling that the specified
 * post updates should be applied to the set of edits.
 *
 * @param  {number} siteId Site ID
 * @param  {number} postId Post ID
 * @param  {object} post   Post attribute updates
 * @returns {object}        Action object
 */
export function editPost( siteId, postId = null, post ) {
	return {
		type: POST_EDIT,
		post,
		siteId,
		postId,
	};
}
