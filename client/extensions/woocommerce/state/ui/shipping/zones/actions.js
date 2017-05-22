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
} from '../../../action-types';

// TODO: Make all this siteId-specific

export const addNewShippingZone = () => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_ADD };
};

export const openShippingZoneForEdit = ( id ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_OPEN, payload: { id } };
};

export const closeEditingShippingZone = () => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_CLOSE };
};

export const cancelEditingShippingZone = () => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_CANCEL };
};

export const changeShippingZoneName = ( name ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_EDIT_NAME, payload: { name } };
};

export const deleteShippingZone = ( id ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_REMOVE, payload: { id } };
};
