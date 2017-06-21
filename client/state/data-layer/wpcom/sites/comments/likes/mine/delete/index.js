/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	COMMENTS_LIKE,
	COMMENTS_LIKE_UPDATE,
	COMMENTS_UNLIKE
} from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';

export const unlikeComment = ( { dispatch }, action ) => dispatch( http( {
	method: 'POST',
	apiVersion: '1.1',
	path: `/sites/${ action.siteId }/comments/${ action.commentId }/likes/mine/delete`
}, action ) );

export const updateCommentLikes = ( { dispatch }, { siteId, postId, commentId }, next, { i_like, like_count } ) => dispatch( {
	type: COMMENTS_LIKE_UPDATE,
	siteId,
	postId,
	commentId,
	iLike: i_like,
	likeCount: like_count
} );

/***
 * dispatches a error notice if creating a new comment request failed
 *
 * @param {Function} dispatch redux dispatcher
 */
export const handleLikeFailure = ( { dispatch }, { siteId, postId, commentId } ) => {
	// revert optimistic updated on error
	dispatch( { type: COMMENTS_LIKE, siteId, postId, commentId } );
	// dispatch a error notice
	dispatch( errorNotice( translate( 'Could not unlike this comment' ) ) );
};

export default {
	[ COMMENTS_UNLIKE ]: [ dispatchRequest( unlikeComment, updateCommentLikes, handleLikeFailure ) ]
};
