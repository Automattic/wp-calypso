/**
 * Internal dependencies
 */
import { WOOCOMMERCE_REVIEW_REPLIES_REQUEST } from 'woocommerce/state/action-types';

export function fetchReviewReplies( siteId, reviewId ) {
	return {
		type: WOOCOMMERCE_REVIEW_REPLIES_REQUEST,
		siteId,
		reviewId,
	};
}
