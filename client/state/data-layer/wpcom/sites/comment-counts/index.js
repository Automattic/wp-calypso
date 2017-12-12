/** @format */

/**
 * External dependencies
 */

// import { translate } from 'i18n-calypso';
// import { flatMap, flatten, isArray, map } from 'lodash';

/**
 * Internal dependencies
 */
import { COMMENT_COUNTS_REQUEST } from 'state/action-types';
import { mergeHandlers } from 'state/action-watchers/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';

export const fetchCommentCounts = action => {
	const { siteId } = action.query;
	const postId = action.query.postId || null;

	return http(
		{
			method: 'GET',
			path: `/sites/${ siteId }/comment-counts`,
			apiVersion: '1.0',
			query: {
				postId,
			},
		},
		action
	);
};

const treeHandlers = {
	[ COMMENT_COUNTS_REQUEST ]: [
		dispatchRequestEx( {
			fetch: fetchCommentCounts,
			onSuccess: () => {},
			onError: () => {},
		} ),
	],
};

export default mergeHandlers( treeHandlers );
