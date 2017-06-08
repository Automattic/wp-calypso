/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_REMOVE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_CHANGE_TYPE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_EDIT_TITLE,
} from 'woocommerce/state/action-types';

export const addMethodToShippingZone = ( siteId, methodType ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD, siteId, methodType };
};

export const removeMethodFromShippingZone = ( siteId, methodId ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_REMOVE, siteId, methodId };
};

export const changeShippingZoneMethodType = ( siteId, methodId, methodType ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_CHANGE_TYPE, siteId, methodId, methodType };
};

export const changeShippingZoneMethodTitle = ( siteId, methodId, title ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_EDIT_TITLE, siteId, methodId, title };
};
