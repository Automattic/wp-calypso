/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_PROMOTIONS_PAGE_SET,
} from 'woocommerce/state/action-types';

export function setPromotionsPage( siteId, currentPage, perPage = 10 ) {
	return {
		type: WOOCOMMERCE_PROMOTIONS_PAGE_SET,
		currentPage,
		perPage,
	};
}

