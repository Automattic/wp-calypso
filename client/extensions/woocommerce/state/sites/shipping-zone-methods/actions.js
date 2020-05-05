/**
 * External dependencies
 */
import { startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import request from 'woocommerce/state/sites/request';
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
import { fetchShippingZoneMethodSettings } from 'woocommerce/woocommerce-services/state/shipping-zone-method-settings/actions';
import config from 'config';

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
		.then( ( data ) => {
			dispatch( fetchShippingZoneMethodsSuccess( siteId, zoneId, data ) );
			return data;
		} )
		.then( ( data ) => {
			// Only need to check the feature flag. If WCS isn't enabled, no "wc_services_*" methods will be returned in the first place
			const wcsMethods = config.isEnabled( 'woocommerce/extension-wcservices' )
				? data.filter( ( { method_id } ) => startsWith( method_id, 'wc_services' ) )
				: [];
			wcsMethods.forEach( ( { id, method_id } ) =>
				dispatch( fetchShippingZoneMethodSettings( siteId, method_id, id ) )
			);
		} )
		.catch( ( err ) => {
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
