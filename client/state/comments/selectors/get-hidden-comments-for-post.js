/**
 * External dependencies
 */
import treeSelect from '@automattic/tree-select';
import { keyBy, pickBy } from 'lodash';

/**
 * Internal dependencies
 */
import { getExpansionsForPost } from 'calypso/state/comments/selectors/get-expansions-for-post';
import { getPostCommentItems } from 'calypso/state/comments/selectors/get-post-comment-items';

import 'calypso/state/comments/init';

export const getHiddenCommentsForPost = treeSelect(
	( state, siteId, postId ) => [
		getPostCommentItems( state, siteId, postId ),
		getExpansionsForPost( state, siteId, postId ),
	],
	( [ comments, expanded ] ) => {
		const commentsById = keyBy( comments, 'ID' );

		return pickBy( commentsById, ( comment ) => ! expanded?.[ comment.ID ] );
	}
);
