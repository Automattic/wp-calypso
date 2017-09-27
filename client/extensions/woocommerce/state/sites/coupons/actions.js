/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_COUPONS_REQUEST,
	WOOCOMMERCE_COUPONS_UPDATED,
} from 'woocommerce/state/action-types';

export function fetchCoupons( siteId, params ) {
	// Default per_page to 10.
	params.per_page = params.per_page || 10;

	return { type: WOOCOMMERCE_COUPONS_REQUEST, siteId, params };
}

export function couponsUpdated( siteId, params, coupons, totalPages, totalCoupons ) {
	return { type: WOOCOMMERCE_COUPONS_UPDATED, siteId, params, coupons, totalPages, totalCoupons };
}

