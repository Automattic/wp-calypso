/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */

/**
 * Return comment counts for the given site and post ID, if applicable.
 *
 * @param {Object} state Redux state
 * @param {Number} siteId Site identifier
 * @param {Number} [postId] Post identifier
 * @returns {Object} The requested comment counts
 */
export const getSiteCommentCounts = ( state, siteId, postId ) => {
	if ( postId ) {
		return get( state, [ 'comments', 'counts', siteId, postId ], null );
	}
	return get( state, [ 'comments', 'counts', siteId, 'site' ], null );
};

export default getSiteCommentCounts;
