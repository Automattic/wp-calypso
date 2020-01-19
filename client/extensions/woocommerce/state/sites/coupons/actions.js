/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_COUPON_CREATE,
	WOOCOMMERCE_COUPON_DELETE,
	WOOCOMMERCE_COUPON_DELETED,
	WOOCOMMERCE_COUPON_UPDATE,
	WOOCOMMERCE_COUPON_UPDATED,
	WOOCOMMERCE_COUPONS_REQUEST,
	WOOCOMMERCE_COUPONS_UPDATED,
} from 'woocommerce/state/action-types';

export function fetchCoupons( siteId, params ) {
	// Default per_page to 10.
	params.per_page = params.per_page || 10;

	return { type: WOOCOMMERCE_COUPONS_REQUEST, siteId, params };
}

export function couponUpdated( siteId, coupon ) {
	return { type: WOOCOMMERCE_COUPON_UPDATED, siteId, coupon };
}

export function couponDeleted( siteId, couponId ) {
	return { type: WOOCOMMERCE_COUPON_DELETED, siteId, couponId };
}

export function couponsUpdated( siteId, params, coupons, totalPages, totalCoupons ) {
	return { type: WOOCOMMERCE_COUPONS_UPDATED, siteId, params, coupons, totalPages, totalCoupons };
}

export function createCoupon( siteId, coupon, successAction, failureAction ) {
	return {
		type: WOOCOMMERCE_COUPON_CREATE,
		siteId,
		coupon,
		successAction,
		failureAction,
	};
}

export function updateCoupon( siteId, coupon, successAction, failureAction ) {
	return {
		type: WOOCOMMERCE_COUPON_UPDATE,
		siteId,
		coupon,
		successAction,
		failureAction,
	};
}

export function deleteCoupon( siteId, couponId, successAction, failureAction ) {
	return {
		type: WOOCOMMERCE_COUPON_DELETE,
		siteId,
		couponId,
		successAction,
		failureAction,
	};
}
