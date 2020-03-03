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
	// Since all the WCS shipping methods use the same reducer, methodType just needs to be a valid WCS method identifier.
	// This works for Canada Post and FedEx too.
	methodType: 'wc_services_usps',
	path,
	value,
} );
