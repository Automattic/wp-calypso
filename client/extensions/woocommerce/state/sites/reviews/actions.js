/**
 * Internal dependencies
 */
import { getNormalizedReviewsQuery } from './utils';
import {
	WOOCOMMERCE_REVIEWS_REQUEST,
} from 'woocommerce/state/action-types';

export function fetchReviews( siteId, query = {} ) {
	const normalizedQuery = getNormalizedReviewsQuery( query );
	return {
		type: WOOCOMMERCE_REVIEWS_REQUEST,
		siteId,
		query: normalizedQuery,
	};
}
