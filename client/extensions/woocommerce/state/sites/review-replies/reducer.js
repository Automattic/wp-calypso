/**
 * External dependencies
 */
import { reject, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_REVIEW_REPLIES_UPDATED,
	WOOCOMMERCE_REVIEW_REPLY_DELETED,
	WOOCOMMERCE_REVIEW_REPLY_UPDATED,
} from 'woocommerce/state/action-types';

export default createReducer( {}, {
	[ WOOCOMMERCE_REVIEW_REPLIES_UPDATED ]: repliesUpdated,
	[ WOOCOMMERCE_REVIEW_REPLY_DELETED ]: replyDeleted,
	[ WOOCOMMERCE_REVIEW_REPLY_UPDATED ]: replyUpdated,
} );

export function repliesUpdated( state, action ) {
	const { reviewId, replies, error } = action;
	const existingReplies = state || {};

	if ( error || ! replies ) {
		return existingReplies;
	}

	return {
		...existingReplies,
		[ reviewId ]: replies,
	};
}

export function replyDeleted( state, action ) {
	const { reviewId, replyId } = action;
	const existingReplies = state || {};

	if ( ! reviewId || ! replyId ) {
		return existingReplies;
	}

	const repliesForReview = existingReplies[ reviewId ];
	const updatedReplies = reject( repliesForReview, { id: replyId } );

	return {
		...existingReplies,
		[ reviewId ]: updatedReplies,
	};
}

export function replyUpdated( state, action ) {
	const { reviewId, replyId, reply } = action;
	const existingReplies = state || {};

	if ( ! reviewId || ! replyId || ! reply ) {
		return existingReplies;
	}

	const repliesForReview = existingReplies[ reviewId ];

	const updatedReplies = repliesForReview.map( ( reviewReply ) => {
		if ( isEqual( replyId, reviewReply.id ) ) {
			return reply;
		}
		return reviewReply;
	} );

	return {
		...existingReplies,
		[ reviewId ]: updatedReplies,
	};
}
