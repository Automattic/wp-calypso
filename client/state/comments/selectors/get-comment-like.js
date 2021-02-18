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
 * Gets likes stats for the comment
 *
 * @param {object} state redux state
 * @param {number} siteId site identification
 * @param {number} postId site identification
 * @param {number} commentId comment identification
 * @returns {object} that has i_like and like_count props
 */
export const getCommentLike = treeSelect(
	( state, siteId, postId ) => [ getPostCommentItems( state, siteId, postId ) ],
	( [ comments ], siteId, postId, commentId ) => {
		const comment = find( comments, { ID: commentId } );

		if ( ! comment ) {
			return undefined;
		}
		const { i_like, like_count } = comment;
		return { i_like, like_count };
	}
);
