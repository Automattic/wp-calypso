/** @format */
/**
 * Internal dependencies
 */
import request from '../request';
import { setError } from '../status/wc-api/actions';
import {
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_CREATE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_DELETE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_DELETED,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_UPDATE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_UPDATED,
	WOOCOMMERCE_SHIPPING_ZONE_METHODS_REQUEST,
	WOOCOMMERCE_SHIPPING_ZONE_METHODS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import { areShippingZoneMethodsLoaded, areShippingZoneMethodsLoading } from './selectors';

export const fetchShippingZoneMethodsSuccess = ( siteId, zoneId, data ) => {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_METHODS_REQUEST_SUCCESS,
		siteId,
		zoneId,
		data,
	};
};

export const fetchShippingZoneMethods = ( siteId, zoneId ) => ( dispatch, getState ) => {
	if (
		areShippingZoneMethodsLoaded( getState(), zoneId, siteId ) ||
		areShippingZoneMethodsLoading( getState(), zoneId, siteId )
	) {
		return;
	}

	const getAction = {
		type: WOOCOMMERCE_SHIPPING_ZONE_METHODS_REQUEST,
		siteId,
		zoneId,
	};

	dispatch( getAction );

	return request( siteId )
		.get( 'shipping/zones/' + zoneId + '/methods' )
		.then( data => {
			dispatch( fetchShippingZoneMethodsSuccess( siteId, zoneId, data ) );
		} )
		.catch( err => {
			dispatch( setError( siteId, getAction, err ) );
		} );
};

export function createShippingZoneMethod(
	siteId,
	zoneId,
	methodId,
	methodType,
	order,
	successAction,
	failureAction
) {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_CREATE,
		siteId,
		zoneId,
		methodId,
		methodType,
		order,
		successAction,
		failureAction,
	};
}

export function updateShippingZoneMethod(
	siteId,
	zoneId,
	methodId,
	method,
	successAction,
	failureAction
) {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_UPDATE,
		siteId,
		zoneId,
		methodId,
		method,
		successAction,
		failureAction,
	};
}

export function deleteShippingZoneMethod( siteId, zoneId, methodId, successAction, failureAction ) {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_DELETE,
		siteId,
		zoneId,
		methodId,
		successAction,
		failureAction,
	};
}

export function shippingZoneMethodUpdated( siteId, data, originatingAction ) {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_UPDATED,
		siteId,
		data,
		originatingAction,
	};
}

export function shippingZoneMethodDeleted( siteId, originatingAction ) {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_DELETED,
		siteId,
		originatingAction,
	};
}
