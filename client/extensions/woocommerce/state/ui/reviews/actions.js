/**
 * Internal dependencies
 */

import { WOOCOMMERCE_UI_REVIEWS_SET_QUERY } from 'woocommerce/state/action-types';

export function updateCurrentReviewsQuery( siteId, query ) {
	return {
		type: WOOCOMMERCE_UI_REVIEWS_SET_QUERY,
		siteId,
		query,
	};
}
