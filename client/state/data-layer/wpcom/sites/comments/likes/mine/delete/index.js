/** @format */

/**
 * External dependencies
 */

import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { COMMENTS_LIKE, COMMENTS_UNLIKE } from 'client/state/action-types';
import { http } from 'client/state/data-layer/wpcom-http/actions';
import { bypassDataLayer } from 'client/state/data-layer/utils';
import { dispatchRequest } from 'client/state/data-layer/wpcom-http/utils';
import { errorNotice } from 'client/state/notices/actions';

export const unlikeComment = ( { dispatch }, action ) => {
	dispatch(
		http(
			{
				method: 'POST',
				apiVersion: '1.1',
				path: `/sites/${ action.siteId }/comments/${ action.commentId }/likes/mine/delete`,
			},
			action
		)
	);
};

export const updateCommentLikes = ( { dispatch }, { siteId, postId, commentId }, { like_count } ) =>
	dispatch(
		bypassDataLayer( {
			type: COMMENTS_UNLIKE,
			siteId,
			postId,
			commentId,
			like_count,
		} )
	);

/***
 * dispatches a error notice if creating a new comment request failed
 *
 * @param {Function} dispatch redux dispatcher
 */
export const handleUnlikeFailure = ( { dispatch }, { siteId, postId, commentId } ) => {
	// revert optimistic update on error
	dispatch( bypassDataLayer( { type: COMMENTS_LIKE, siteId, postId, commentId } ) );
	// dispatch a error notice
	dispatch( errorNotice( translate( 'Could not unlike this comment' ) ) );
};

export default {
	[ COMMENTS_UNLIKE ]: [
		dispatchRequest( unlikeComment, updateCommentLikes, handleUnlikeFailure ),
	],
};
