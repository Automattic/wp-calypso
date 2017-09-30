/**
 * External dependencies
 */
import { trim } from 'lodash';

/**
 * Internal dependencies
 */
import debugFactory from 'debug';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import request from 'woocommerce/state/sites/http-request';
import {
	WOOCOMMERCE_COUPONS_REQUEST,
} from 'woocommerce/state/action-types';
import { couponsUpdated } from './actions';

const debug = debugFactory( 'woocommerce:coupons' );

export default {
	[ WOOCOMMERCE_COUPONS_REQUEST ]: [
		dispatchRequest( requestCoupons, requestCouponsSuccess, apiError )
	]
};

export function requestCoupons( { dispatch }, action ) {
	const { siteId, params } = action;
	const paramString = Object.keys( params ).map(
		( key ) => encodeURIComponent( trim( key ) ) + '=' + encodeURIComponent( trim( params[ key ] ) )
	).join( '&' );
	const path = `coupons?${ paramString }`;

	dispatch( request( siteId, action ).getWithHeaders( path ) );
}

export function requestCouponsSuccess( { dispatch }, action, { data } ) {
	const { siteId, params } = action;
	const { body, headers } = data;
	const totalPages = Number( headers[ 'X-WP-TotalPages' ] );
	const totalCoupons = Number( headers[ 'X-WP-Total' ] );

	if ( ! isValidCouponsArray( body ) ) {
		// Discard this data, it's not valid.
		// TODO: Consider if we need an application error state here.
		debug( 'Invalid Coupons Array: ', body );
		return;
	}

	dispatch( couponsUpdated( siteId, params, body, totalPages, totalCoupons ) );
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

