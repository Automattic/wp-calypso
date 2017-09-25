/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { couponsPageUpdated } from './actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { WOOCOMMERCE_COUPONS_REQUEST_PAGE } from 'woocommerce/state/action-types';
import request from 'woocommerce/state/sites/http-request';

const debug = debugFactory( 'woocommerce:coupons' );

export default {
	[ WOOCOMMERCE_COUPONS_REQUEST_PAGE ]: [
		dispatchRequest( requestCouponsPage, requestCouponsPageSuccess, apiError )
	]
};

export function requestCouponsPage( { dispatch }, action ) {
	const { siteId, pageIndex, perPage } = action;
	const path = `coupons?page=${ pageIndex }&per_page=${ perPage }`;

	dispatch( request( siteId, action ).getWithHeaders( path ) );
}

export function requestCouponsPageSuccess( { dispatch }, action, { data } ) {
	const { siteId, pageIndex } = action;
	const { body, headers } = data;
	const totalPages = Number( headers[ 'X-WP-TotalPages' ] );
	const totalCoupons = Number( headers[ 'X-WP-Total' ] );

	if ( ! isValidCouponsArray( body ) ) {
		// Discard this data, it's not valid.
		// TODO: Consider if we need an application error state here.
		debug( 'Invalid Coupons Array: ', body );
		return;
	}

	dispatch( couponsPageUpdated( siteId, pageIndex, body, totalPages, totalCoupons ) );
}

function apiError( { dispatch }, action, error ) {
	// Discard this request.
	// TODO: Consider if we need an application error state here.
	debug( 'API Error: ', error );
}

function isValidCouponsArray( coupons ) {
	if ( ! Array.isArray( coupons ) ) {
		return false;
	}

	for ( let i = 0; i < coupons.length; i++ ) {
		if ( ! isValidCoupon( coupons[ i ] ) ) {
			// Short-circuit and return now.
			return false;
		}
	}
	return true;
}

function isValidCoupon( coupon ) {
	return (
		coupon &&
		coupon.id && ( 'number' === typeof coupon.id ) &&
		coupon.code && ( 'string' === typeof coupon.code )
	);
}

