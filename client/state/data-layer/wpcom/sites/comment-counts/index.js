/** @format */

/**
 * External dependencies
 */
import { mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import { COMMENT_COUNTS_REQUEST, COMMENT_COUNTS_UPDATE } from 'state/action-types';
import { mergeHandlers } from 'state/action-watchers/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const fetchCommentCounts = action => {
	const { siteId, postId } = action;

	return http(
		{
			method: 'GET',
			path: `/sites/${ siteId }/comment-counts`,
			apiVersion: '1.0',
			query: {
				post_id: postId,
			},
		},
		action
	);
};

export const updateCommentCounts = ( action, response ) => {
	const intResponse = mapValues( response, value => parseInt( value ) );
	const {
		all,
		approved,
		pending,
		post_trashed: postTrashed,
		spam,
		total_comments: totalComments,
		trash,
	} = intResponse;
	const { siteId, postId } = action;
	return {
		type: COMMENT_COUNTS_UPDATE,
		siteId,
		postId,
		all,
		approved,
		pending,
		postTrashed,
		spam,
		totalComments,
		trash,
	};
};

const countHandlers = {
	[ COMMENT_COUNTS_REQUEST ]: [
		dispatchRequestEx( {
			fetch: fetchCommentCounts,
			onSuccess: updateCommentCounts,
			onError: () => {},
		} ),
	],
};

registerHandlers(
	'state/data-layer/wpcom/sites/comment-counts/index.js',
	mergeHandlers( countHandlers )
);

export default {};
