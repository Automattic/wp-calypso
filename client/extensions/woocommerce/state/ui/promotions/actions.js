/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_PROMOTION_EDIT,
	WOOCOMMERCE_PROMOTION_EDIT_CLEAR,
	WOOCOMMERCE_PROMOTIONS_PAGE_SET,
} from 'woocommerce/state/action-types';

export function editPromotion( siteId, promotion, data ) {
	return {
		type: WOOCOMMERCE_PROMOTION_EDIT,
		siteId,
		promotion,
		data,
	};
}

export function clearPromotionEdits( siteId ) {
	return {
		type: WOOCOMMERCE_PROMOTION_EDIT_CLEAR,
		siteId,
	};
}

export function setPromotionsPage( siteId, currentPage, perPage = 10 ) {
	return {
		type: WOOCOMMERCE_PROMOTIONS_PAGE_SET,
		currentPage,
		perPage,
	};
}

