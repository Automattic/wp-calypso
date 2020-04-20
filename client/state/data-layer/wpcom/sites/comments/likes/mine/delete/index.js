/**
 * External dependencies
 */

import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { COMMENTS_LIKE, COMMENTS_UNLIKE } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { bypassDataLayer } from 'state/data-layer/utils';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const unlikeComment = ( action ) =>
	http(
		{
			method: 'POST',
			apiVersion: '1.1',
			path: `/sites/${ action.siteId }/comments/${ action.commentId }/likes/mine/delete`,
		},
		action
	);

export const updateCommentLikes = ( { siteId, postId, commentId }, { like_count } ) =>
	bypassDataLayer( {
		type: COMMENTS_UNLIKE,
		siteId,
		postId,
		commentId,
		like_count,
	} );

export const handleUnlikeFailure = ( { siteId, postId, commentId } ) => [
	// revert optimistic update on error
	bypassDataLayer( { type: COMMENTS_LIKE, siteId, postId, commentId } ),
	// dispatch a error notice
	errorNotice( translate( 'Could not unlike this comment' ) ),
];

registerHandlers( 'state/data-layer/wpcom/sites/comments/likes/mine/delete/index.js', {
	[ COMMENTS_UNLIKE ]: [
		dispatchRequest( {
			fetch: unlikeComment,
			onSuccess: updateCommentLikes,
			onError: handleUnlikeFailure,
		} ),
	],
} );

export default {};
