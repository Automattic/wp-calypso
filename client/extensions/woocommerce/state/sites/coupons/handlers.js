/**
 * External dependencies
 */
import { trim, isFunction } from 'lodash';
import warn from 'lib/warn';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
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

export function requestCoupons( action ) {
	const { siteId, params } = action;
	const paramString = Object.keys( params )
		.map(
			( key ) =>
				encodeURIComponent( trim( key ) ) + '=' + encodeURIComponent( trim( params[ key ] ) )
		)
		.join( '&' );
	const path = `coupons?${ paramString }`;

	return request( siteId, action ).getWithHeaders( path );
}

export function requestCouponsSuccess( action, { data } ) {
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

	return couponsUpdated( siteId, params, body, totalPages, totalCoupons );
}

export function couponCreate( action ) {
	const { siteId, coupon } = action;
	const path = 'coupons';

	return request( siteId, action ).post( path, coupon );
}

export function couponCreateSuccess( action ) {
	const actions = [ couponUpdated( action.siteId, action.coupon ) ];
	if ( action.successAction ) {
		actions.push( action.successAction );
	}

	return actions;
}

export function couponUpdate( action ) {
	const { siteId, coupon } = action;
	const path = `coupons/${ coupon.id }`;

	return request( siteId, action ).put( path, coupon );
}

export function couponUpdateSuccess( action ) {
	const actions = [ couponUpdated( action.siteId, action.coupon ) ];
	if ( action.successAction ) {
		actions.push( action.successAction );
	}
	return actions;
}

export function couponDelete( action ) {
	const { siteId, couponId } = action;
	const path = `coupons/${ couponId }?force=true`;

	return request( siteId, action ).del( path );
}

export function couponDeleteSuccess( action ) {
	const actions = [ couponDeleted( action.siteId, action.couponId ) ];
	if ( action.successAction ) {
		actions.push( action.successAction );
	}
	return actions;
}

function apiError( action, error ) {
	warn( 'Coupon API Error: ', error );

	const { failureAction } = action;
	if ( ! failureAction ) {
		return;
	}

	if ( isFunction( failureAction ) ) {
		return failureAction( error );
	}

	return failureAction;
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
	return coupon && coupon.id && 'number' === typeof coupon.id && 'string' === typeof coupon.code;
}

export default {
	[ WOOCOMMERCE_COUPONS_REQUEST ]: [
		dispatchRequest( {
			fetch: requestCoupons,
			onSuccess: requestCouponsSuccess,
			onError: apiError,
		} ),
	],
	[ WOOCOMMERCE_COUPON_CREATE ]: [
		dispatchRequest( {
			fetch: couponCreate,
			onSuccess: couponCreateSuccess,
			onError: apiError,
		} ),
	],
	[ WOOCOMMERCE_COUPON_UPDATE ]: [
		dispatchRequest( {
			fetch: couponUpdate,
			onSuccess: couponUpdateSuccess,
			onError: apiError,
		} ),
	],
	[ WOOCOMMERCE_COUPON_DELETE ]: [
		dispatchRequest( {
			fetch: couponDelete,
			onSuccess: couponDeleteSuccess,
			onError: apiError,
		} ),
	],
};
