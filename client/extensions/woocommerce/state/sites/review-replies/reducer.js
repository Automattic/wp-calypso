/**
 * External dependencies
 */

import { reject, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import { withoutPersistence } from 'state/utils';
import {
	WOOCOMMERCE_REVIEW_REPLIES_UPDATED,
	WOOCOMMERCE_REVIEW_REPLY_CREATED,
	WOOCOMMERCE_REVIEW_REPLY_DELETED,
	WOOCOMMERCE_REVIEW_REPLY_UPDATED,
} from 'woocommerce/state/action-types';

export default withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case WOOCOMMERCE_REVIEW_REPLIES_UPDATED:
			return repliesUpdated( state, action );
		case WOOCOMMERCE_REVIEW_REPLY_DELETED:
			return replyDeleted( state, action );
		case WOOCOMMERCE_REVIEW_REPLY_UPDATED:
			return replyUpdated( state, action );
		case WOOCOMMERCE_REVIEW_REPLY_CREATED:
			return replyCreated( state, action );
	}

	return state;
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

export function replyCreated( state, action ) {
	const { reviewId, reply } = action;
	const existingReplies = state || {};

	if ( ! reviewId || ! reply ) {
		return existingReplies;
	}

	const repliesForReview = existingReplies[ reviewId ];
	repliesForReview.push( reply );

	return {
		...existingReplies,
		[ reviewId ]: repliesForReview,
	};
}
