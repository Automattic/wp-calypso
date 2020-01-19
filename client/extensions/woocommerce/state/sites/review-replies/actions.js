/**
 * Internal dependencies
 */

import {
	WOOCOMMERCE_REVIEW_REPLIES_REQUEST,
	WOOCOMMERCE_REVIEW_REPLY_CREATE_REQUEST,
	WOOCOMMERCE_REVIEW_REPLY_DELETE_REQUEST,
	WOOCOMMERCE_REVIEW_REPLY_UPDATE_REQUEST,
} from 'woocommerce/state/action-types';

export function fetchReviewReplies( siteId, reviewId ) {
	return {
		type: WOOCOMMERCE_REVIEW_REPLIES_REQUEST,
		siteId,
		reviewId,
	};
}

export function createReviewReply( siteId, productId, reviewId, replyText, shouldApprove ) {
	return {
		type: WOOCOMMERCE_REVIEW_REPLY_CREATE_REQUEST,
		siteId,
		productId,
		reviewId,
		replyText,
		shouldApprove,
	};
}

export function deleteReviewReply( siteId, reviewId, replyId ) {
	return {
		type: WOOCOMMERCE_REVIEW_REPLY_DELETE_REQUEST,
		siteId,
		reviewId,
		replyId,
	};
}

export function updateReviewReply( siteId, reviewId, replyId, changes ) {
	return {
		type: WOOCOMMERCE_REVIEW_REPLY_UPDATE_REQUEST,
		siteId,
		reviewId,
		replyId,
		changes,
	};
}
