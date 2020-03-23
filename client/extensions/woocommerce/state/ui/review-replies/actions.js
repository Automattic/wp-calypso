/**
 * Internal dependencies
 */

import {
	WOOCOMMERCE_UI_REVIEW_REPLIES_CLEAR_EDIT,
	WOOCOMMERCE_UI_REVIEW_REPLIES_EDIT,
} from 'woocommerce/state/action-types';

export function clearReviewReplyEdits( siteId ) {
	return {
		type: WOOCOMMERCE_UI_REVIEW_REPLIES_CLEAR_EDIT,
		siteId,
	};
}

export function editReviewReply( siteId, reviewId, reply ) {
	return {
		type: WOOCOMMERCE_UI_REVIEW_REPLIES_EDIT,
		siteId,
		reviewId,
		reply,
	};
}
