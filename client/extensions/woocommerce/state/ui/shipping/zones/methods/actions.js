/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_REMOVE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_CHANGE_TYPE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_EDIT_TITLE,
} from 'woocommerce/state/action-types';

export const addMethodToShippingZone = ( siteId, method_id ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD, siteId, payload: { method_id } };
};

export const removeMethodFromShippingZone = ( siteId, id ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_REMOVE, siteId, payload: { id } };
};

export const changeShippingZoneMethodType = ( siteId, id, method_id ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_CHANGE_TYPE, siteId, payload: { id, method_id } };
};

export const changeShippingZoneMethodTitle = ( siteId, id, title ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_EDIT_TITLE, siteId, payload: { id, title } };
};
