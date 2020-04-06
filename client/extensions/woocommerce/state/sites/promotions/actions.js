/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_PROMOTION_CREATE,
	WOOCOMMERCE_PROMOTION_DELETE,
	WOOCOMMERCE_PROMOTION_UPDATE,
	WOOCOMMERCE_PROMOTIONS_REQUEST,
} from 'woocommerce/state/action-types';

export function fetchPromotions( siteId, perPage = undefined ) {
	return {
		type: WOOCOMMERCE_PROMOTIONS_REQUEST,
		siteId,
		perPage,
	};
}

export function createPromotion( siteId, promotion, successAction, failureAction ) {
	return {
		type: WOOCOMMERCE_PROMOTION_CREATE,
		siteId,
		promotion,
		successAction,
		failureAction,
	};
}

export function updatePromotion( siteId, promotion, successAction, failureAction ) {
	return {
		type: WOOCOMMERCE_PROMOTION_UPDATE,
		siteId,
		promotion,
		successAction,
		failureAction,
	};
}

export function deletePromotion( siteId, promotion, successAction, failureAction ) {
	return {
		type: WOOCOMMERCE_PROMOTION_DELETE,
		siteId,
		promotion,
		successAction,
		failureAction,
	};
}
