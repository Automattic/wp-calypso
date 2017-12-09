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
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';

export const fetchCommentCounts = ( { dispatch }, action ) => {
	const { siteId } = action.query;
	const postId = action.query.postId || null;

	dispatch(
		http(
			{
				method: 'GET',
				path: `/sites/${ siteId }/comment-counts`,
				apiVersion: '1.0',
				query: {
					postId,
				},
			},
			action
		)
	);
};

const treeHandlers = {
	[ COMMENT_COUNTS_REQUEST ]: [ dispatchRequest( fetchCommentCounts ) ],
};

export default mergeHandlers( treeHandlers );
