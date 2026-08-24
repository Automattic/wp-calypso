import { sortBy } from '@automattic/js-utils';
import treeSelect from '@automattic/tree-select';
import { getPostCommentItems } from 'calypso/state/comments/selectors/get-post-comment-items';

import 'calypso/state/comments/init';

export const getDateSortedPostComments = treeSelect(
	( state, siteId, postId ) => [ getPostCommentItems( state, siteId, postId ) ],
	( [ comments ] ) => {
		return sortBy( comments, ( comment ) => new Date( comment.date ) );
	}
);
