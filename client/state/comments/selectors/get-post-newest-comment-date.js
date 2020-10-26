/**
 * External dependencies
 */
import treeSelect from '@automattic/tree-select';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import { getPostCommentItems } from 'calypso/state/comments/selectors/get-post-comment-items';

import 'calypso/state/comments/init';

/**
 * Get most recent comment date for a given post
 *
 * @param {object} state redux state
 * @param {number} siteId site identification
 * @param {number} postId site identification
 * @returns {Date} most recent comment date
 */
export const getPostNewestCommentDate = treeSelect(
	( state, siteId, postId ) => [ getPostCommentItems( state, siteId, postId ) ],
	( [ comments ] ) => {
		const firstContiguousComment = find( comments, 'contiguous' );
		return firstContiguousComment ? new Date( firstContiguousComment.date ) : undefined;
	}
);
