import { translate } from 'i18n-calypso';
import { COMMENTS_LIKE, COMMENTS_UNLIKE } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { bypassDataLayer } from 'calypso/state/data-layer/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice } from 'calypso/state/notices/actions';

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
