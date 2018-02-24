/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @param {Number} postId Post ID
 * @return {Boolean} true if we are fetching revisions for a post
 */
export default function isRequestingPostRevisions( state, siteId, postId ) {
	return get( state, [ 'posts', 'revisions', 'requesting', siteId, postId ], false );
}
