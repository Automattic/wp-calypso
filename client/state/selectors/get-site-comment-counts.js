/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/comments/init';

/**
 * Return comment counts for the given site and post ID, if applicable.
 *
 * @param {object} state Redux state
 * @param {number} siteId Site identifier
 * @param {number} [postId] Post identifier
 * @returns {object} The requested comment counts
 */
export const getSiteCommentCounts = ( state, siteId, postId ) => {
	if ( postId ) {
		return get( state, [ 'comments', 'counts', siteId, postId ], null );
	}
	return get( state, [ 'comments', 'counts', siteId, 'site' ], null );
};

export default getSiteCommentCounts;
