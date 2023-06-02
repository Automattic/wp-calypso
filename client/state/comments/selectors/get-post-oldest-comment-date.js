import treeSelect from '@automattic/tree-select';
import { findLast } from 'lodash';
import { getPostCommentItems } from 'calypso/state/comments/selectors/get-post-comment-items';

import 'calypso/state/comments/init';

/**
 * Get oldest comment date for a given post
 *
 * @param {Object} state redux state
 * @param {number} siteId site identification
 * @param {number} postId site identification
 * @returns {Date} earliest comment date
 */
export const getPostOldestCommentDate = treeSelect(
	( state, siteId, postId ) => [ getPostCommentItems( state, siteId, postId ) ],
	( [ comments ] ) => {
		const lastContiguousComment = findLast( comments, 'contiguous' );
		return lastContiguousComment ? new Date( lastContiguousComment.date ) : undefined;
	}
);
