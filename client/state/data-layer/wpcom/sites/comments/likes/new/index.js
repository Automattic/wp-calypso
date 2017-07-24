/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { COMMENTS_LIKE, COMMENTS_UNLIKE } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { local } from 'state/data-layer/utils';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';

export const likeComment = ( { dispatch }, action ) => {
	dispatch(
		http(
			{
				method: 'POST',
				apiVersion: '1.1',
				path: `/sites/${ action.siteId }/comments/${ action.commentId }/likes/new`,
			},
			action,
		),
	);
};

export const updateCommentLikes = (
	{ dispatch },
	{ siteId, postId, commentId },
	next,
	{ like_count },
) =>
	dispatch(
		local( {
			type: COMMENTS_LIKE,
			siteId,
			postId,
			commentId,
			like_count,
		} ),
	);

/***
 * dispatches a error notice if creating a new comment request failed
 *
 * @param {Function} dispatch redux dispatcher
 */
export const handleLikeFailure = ( { dispatch }, { siteId, postId, commentId } ) => {
	// revert optimistic updated on error
	dispatch( local( { type: COMMENTS_UNLIKE, siteId, postId, commentId } ) );
	// dispatch a error notice
	dispatch( errorNotice( translate( 'Could not like this comment' ) ) );
};

export default {
	[ COMMENTS_LIKE ]: [ dispatchRequest( likeComment, updateCommentLikes, handleLikeFailure ) ],
};
