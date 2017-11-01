/**
 * External dependencies
 *
 * @format
 */
import { findIndex } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_COUPON_DELETED,
	WOOCOMMERCE_COUPON_UPDATED,
	WOOCOMMERCE_COUPONS_UPDATED,
} from 'woocommerce/state/action-types';

export default createReducer(
	{},
	{
		[ WOOCOMMERCE_COUPON_DELETED ]: couponDeleted,
		[ WOOCOMMERCE_COUPON_UPDATED ]: couponUpdated,
		[ WOOCOMMERCE_COUPONS_UPDATED ]: pageUpdated,
	}
);

function couponDeleted( state, action ) {
	const { couponId } = action;
	const { coupons } = state;

	const newCoupons = coupons.filter( coupon => couponId !== coupon.id );

	if ( newCoupons.length !== coupons.length ) {
		return { ...state, coupons: newCoupons };
	}
	return state;
}

function couponUpdated( state, action ) {
	const { coupon } = action;
	const { coupons } = state;
	const index = findIndex( coupons, { id: coupon.id } );

	if ( -1 < index ) {
		const newCoupons = [ ...coupons ];
		newCoupons[ index ] = coupon;
		return { ...state, coupons: newCoupons };
	}
	return state;
}

function pageUpdated( state, action ) {
	const { params, coupons, totalPages, totalCoupons } = action;

	if ( coupons ) {
		return {
			params,
			coupons,
			totalPages,
			totalCoupons,
		};
	}

	return null;
}
