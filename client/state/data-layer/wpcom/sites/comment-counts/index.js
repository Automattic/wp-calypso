/**
 * External dependencies
 */
import { mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import { COMMENT_COUNTS_REQUEST, COMMENT_COUNTS_UPDATE } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const fetchCommentCounts = ( action ) => {
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
	const intResponse = mapValues( response, ( value ) => parseInt( value ) );
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

registerHandlers( 'state/data-layer/wpcom/sites/comment-counts/index.js', {
	[ COMMENT_COUNTS_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchCommentCounts,
			onSuccess: updateCommentCounts,
			onError: () => {},
		} ),
	],
} );
