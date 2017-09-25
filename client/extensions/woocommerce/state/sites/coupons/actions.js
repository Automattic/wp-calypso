/**
 * Internal dependencies
 */
import { WOOCOMMERCE_COUPONS_REQUEST_PAGE, WOOCOMMERCE_COUPONS_PAGE_UPDATED } from 'woocommerce/state/action-types';

export function fetchCouponsPage( siteId, pageIndex = 1, perPage = 10 ) {
	return { type: WOOCOMMERCE_COUPONS_REQUEST_PAGE, siteId, pageIndex, perPage };
}

export function couponsPageUpdated( siteId, pageIndex, coupons, totalPages, totalCoupons ) {
	return { type: WOOCOMMERCE_COUPONS_PAGE_UPDATED, siteId, pageIndex, coupons, totalPages, totalCoupons };
}

