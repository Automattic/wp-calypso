/**
 * Internal dependencies
 */

import { getNormalizedReviewsQuery } from './utils';
import {
	WOOCOMMERCE_REVIEWS_REQUEST,
	WOOCOMMERCE_REVIEW_DELETE,
	WOOCOMMERCE_REVIEW_STATUS_CHANGE,
} from 'woocommerce/state/action-types';

export function fetchReviews( siteId, query = {} ) {
	const normalizedQuery = getNormalizedReviewsQuery( query );
	return {
		type: WOOCOMMERCE_REVIEWS_REQUEST,
		siteId,
		query: normalizedQuery,
	};
}

export function deleteReview( siteId, productId, reviewId ) {
	return {
		type: WOOCOMMERCE_REVIEW_DELETE,
		siteId,
		productId,
		reviewId,
	};
}

export function changeReviewStatus( siteId, productId, reviewId, currentStatus, newStatus ) {
	return {
		type: WOOCOMMERCE_REVIEW_STATUS_CHANGE,
		siteId,
		productId,
		reviewId,
		currentStatus,
		newStatus,
	};
}
