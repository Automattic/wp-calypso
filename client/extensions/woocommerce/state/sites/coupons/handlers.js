/**
 * External dependencies
 *
 * @format
 */
import { trim } from 'lodash';

/**
 * Internal dependencies
 */
import debugFactory from 'debug';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import request from 'woocommerce/state/sites/http-request';
import {
	WOOCOMMERCE_COUPON_CREATE,
	WOOCOMMERCE_COUPON_DELETE,
	WOOCOMMERCE_COUPON_UPDATE,
	WOOCOMMERCE_COUPONS_REQUEST,
} from 'woocommerce/state/action-types';
import { couponDeleted, couponUpdated, couponsUpdated } from './actions';

const debug = debugFactory( 'woocommerce:coupons' );

export default {
	[ WOOCOMMERCE_COUPONS_REQUEST ]: [
		dispatchRequest( requestCoupons, requestCouponsSuccess, apiError ),
	],
	[ WOOCOMMERCE_COUPON_CREATE ]: [ dispatchRequest( couponCreate, couponCreateSuccess, apiError ) ],
	[ WOOCOMMERCE_COUPON_UPDATE ]: [ dispatchRequest( couponUpdate, couponUpdateSuccess, apiError ) ],
	[ WOOCOMMERCE_COUPON_DELETE ]: [ dispatchRequest( couponDelete, couponDeleteSuccess, apiError ) ],
};

export function requestCoupons( { dispatch }, action ) {
	const { siteId, params } = action;
	const paramString = Object.keys( params )
		.map(
			key => encodeURIComponent( trim( key ) ) + '=' + encodeURIComponent( trim( params[ key ] ) )
		)
		.join( '&' );
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

export function couponCreate( { dispatch }, action ) {
	const { siteId, coupon } = action;
	const path = 'coupons';

	dispatch( request( siteId, action ).post( path, coupon ) );
}

export function couponCreateSuccess( { dispatch }, action ) {
	dispatch( couponUpdated( action.siteId, action.coupon ) );
	if ( action.successAction ) {
		dispatch( action.successAction );
	}
}

export function couponUpdate( { dispatch }, action ) {
	const { siteId, coupon } = action;
	const path = `coupons/${ coupon.id }`;

	dispatch( request( siteId, action ).put( path, coupon ) );
}

export function couponUpdateSuccess( { dispatch }, action ) {
	dispatch( couponUpdated( action.siteId, action.coupon ) );
	if ( action.successAction ) {
		dispatch( action.successAction );
	}
}

export function couponDelete( { dispatch }, action ) {
	const { siteId, couponId } = action;
	const path = `coupons/${ couponId }`;

	dispatch( request( siteId, action ).del( path ) );
}

export function couponDeleteSuccess( { dispatch }, action ) {
	dispatch( couponDeleted( action.siteId, action.couponId ) );
	if ( action.successAction ) {
		dispatch( action.successAction );
	}
}

function apiError( { dispatch }, action, error ) {
	debug( 'API Error: ', error );

	if ( action.failureAction ) {
		dispatch( action.failureAction );
	}
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
		coupon.id &&
		'number' === typeof coupon.id &&
		coupon.code &&
		'string' === typeof coupon.code
	);
}
