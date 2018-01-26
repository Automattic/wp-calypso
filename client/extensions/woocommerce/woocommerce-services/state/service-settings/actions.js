/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SERVICES_SHIPPING_ZONE_METHOD_UPDATE,
	WOOCOMMERCE_SERVICES_SERVICE_SETTINGS_UPDATE_FIELD,
} from '../action-types';

export const updateWcsShippingZoneMethod = (
	siteId,
	methodId,
	methodType,
	method,
	successAction,
	failureAction
) => ( {
	type: WOOCOMMERCE_SERVICES_SHIPPING_ZONE_METHOD_UPDATE,
	siteId,
	methodId,
	methodType,
	method,
	successAction,
	failureAction,
} );

export const updateField = ( siteId, methodId, path, value ) => ( {
	type: WOOCOMMERCE_SERVICES_SERVICE_SETTINGS_UPDATE_FIELD,
	siteId,
	methodId,
	methodType: 'wc_services_usps', // Will work for the other methods too since they share the same reducer
	path,
	value,
} );
