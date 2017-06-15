/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_REMOVE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_CHANGE_TYPE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_EDIT_TITLE,
} from 'woocommerce/state/action-types';

/**
 * Adds a new shipping method to the shipping zone currently being edited.
 * @param {Number} siteId Site ID.
 * @param {String} methodType Type of shipping method to add. For example, "free_shipping", "local_pickup".
 * @return {Object} Action object.
 */
export const addMethodToShippingZone = ( siteId, methodType ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD, siteId, methodType };
};

/**
 * Removes the given shipping method from the shipping zone currently being edited.
 * @param {Number} siteId Site ID.
 * @param {String} methodId ID of the shipping method to delete.
 * @return {Object} Action object.
 */
export const removeMethodFromShippingZone = ( siteId, methodId ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_REMOVE, siteId, methodId };
};

/**
 * Changes the given shipping method into a shipping method of a new type. Note that, underneath, this removes the
 * shipping method from the shipping zone, and creates a new one of the given type.
 * @param {Number} siteId Site ID.
 * @param {String} methodId ID of the shipping method to change type.
 * @param {String} methodType New shipping method type to switch to. For example, "free_shipping", "local_pickup".
 * @return {Object} Action object.
 */
export const changeShippingZoneMethodType = ( siteId, methodId, methodType ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_CHANGE_TYPE, siteId, methodId, methodType };
};

/**
 * Changes the title of the given shipping method.
 * @param {Number} siteId Site ID.
 * @param {String} methodId ID of the shipping method.
 * @param {String} title New user-facing title for the shipping method.
 * @return {Object} Action object.
 */
export const changeShippingZoneMethodTitle = ( siteId, methodId, title ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_EDIT_TITLE, siteId, methodId, title };
};
