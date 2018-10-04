/** @format */

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

export const likeComment = ( { dispatch }, action ) => {
	dispatch(
		http(
			{
				method: 'POST',
				apiVersion: '1.1',
				path: `/sites/${ action.siteId }/comments/${ action.commentId }/likes/new`,
			},
			action
		)
	);
};

export const updateCommentLikes = ( { dispatch }, { siteId, postId, commentId }, { like_count } ) =>
	dispatch(
		bypassDataLayer( {
			type: COMMENTS_LIKE,
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
export const handleLikeFailure = ( { dispatch }, { siteId, postId, commentId } ) => {
	// revert optimistic updated on error
	dispatch( bypassDataLayer( { type: COMMENTS_UNLIKE, siteId, postId, commentId } ) );
	// dispatch a error notice
	dispatch( errorNotice( translate( 'Could not like this comment' ) ) );
};

registerHandlers( 'state/data-layer/wpcom/sites/comments/likes/new/index.js', {
	[ COMMENTS_LIKE ]: [ dispatchRequest( likeComment, updateCommentLikes, handleLikeFailure ) ],
} );

export default {};
