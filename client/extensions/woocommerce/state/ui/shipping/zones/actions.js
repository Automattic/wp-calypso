/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SHIPPING_ZONE_ADD,
	WOOCOMMERCE_SHIPPING_ZONE_CANCEL,
	WOOCOMMERCE_SHIPPING_ZONE_CLOSE,
	WOOCOMMERCE_SHIPPING_ZONE_EDIT_NAME,
	WOOCOMMERCE_SHIPPING_ZONE_OPEN,
	WOOCOMMERCE_SHIPPING_ZONE_REMOVE,
} from 'woocommerce/state/action-types';

export const addNewShippingZone = ( siteId ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_ADD, siteId };
};

export const openShippingZoneForEdit = ( siteId, id ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_OPEN, siteId, payload: { id } };
};

export const closeEditingShippingZone = ( siteId ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_CLOSE, siteId };
};

export const cancelEditingShippingZone = ( siteId ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_CANCEL, siteId };
};

export const changeShippingZoneName = ( siteId, name ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_EDIT_NAME, siteId, payload: { name } };
};

export const deleteShippingZone = ( siteId, id ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_REMOVE, siteId, payload: { id } };
};
