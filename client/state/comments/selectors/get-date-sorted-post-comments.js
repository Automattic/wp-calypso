import treeSelect from '@automattic/tree-select';
import { orderBy, sortBy } from 'lodash';
import { getPostCommentItems } from 'calypso/state/comments/selectors/get-post-comment-items';

import 'calypso/state/comments/init';

export const getDateSortedPostComments = treeSelect(
	( state, siteId, postId ) => [ getPostCommentItems( state, siteId, postId ) ],
	( [ comments ] ) => {
		return orderBy(
			sortBy( comments, ( comment ) => new Date( comment.date ) ),
			'date',
			'desc'
		);
	}
);
