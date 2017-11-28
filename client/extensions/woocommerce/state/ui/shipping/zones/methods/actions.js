/** @format */

/**
 * Internal dependencies
 */

import {
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_OPEN,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_CANCEL,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_CLOSE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_REMOVE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_CHANGE_TYPE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_EDIT_TITLE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_TOGGLE_ENABLED,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_TOGGLE_OPENED_ENABLED,
} from 'woocommerce/state/action-types';

/**
 * Adds a new shipping method to the shipping zone currently being edited.
 * @param {Number} siteId Site ID.
 * @param {String} methodType Type of shipping method to add. For example, "free_shipping", "local_pickup".
 * @param {String} title Title of the new method.
 * @return {Object} Action object.
 */
export const addMethodToShippingZone = ( siteId, methodType, title ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD, siteId, methodType, title };
};

/**
 * Opens the shipping method for editing
 * @param {Number} siteId Site ID.
 * @param {Number|Object} methodId ID of the shipping method to open.
 * @return {Object} Action object.
 */
export const openShippingZoneMethod = ( siteId, methodId ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_OPEN, siteId, methodId };
};

/**
 * Closes the currently edited shipping method and discards the changes
 * @param {Number} siteId Site ID.
 * @return {Object} Action object.
 */
export const cancelShippingZoneMethod = siteId => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_CANCEL, siteId };
};

/**
 * Closes the currently edited shipping method and saves the changes
 * @param {Number} siteId Site ID.
 * @return {Object} Action object.
 */
export const closeShippingZoneMethod = siteId => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_CLOSE, siteId };
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
 * Changes the opened shipping method into a shipping method of a new type. Note that, on save, this will remove the
 * shipping method from the shipping zone, and will create a new one of the given type.
 * @param {Number} siteId Site ID.
 * @param {String} methodType New shipping method type to switch to. For example, "free_shipping", "local_pickup".
 * @param {String} title New method title.
 * @return {Object} Action object.
 */
export const changeShippingZoneMethodType = ( siteId, methodType, title ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_CHANGE_TYPE, siteId, methodType, title };
};

/**
 * Changes the title of the opened shipping method.
 * @param {Number} siteId Site ID.
 * @param {String} title New user-facing title for the shipping method.
 * @return {Object} Action object.
 */
export const changeShippingZoneMethodTitle = ( siteId, title ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_EDIT_TITLE, siteId, title };
};

/**
 * Enables or disables the opened shipping zone method. Does not change the state of the actual method until saved
 * @param {Number} siteId Site ID.
 * @param {Boolean} enabled Whether to enable (true) or disable (false) the shipping method.
 * @return {Object} Action object.
 */
export const toggleOpenedShippingZoneMethodEnabled = ( siteId, enabled ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_TOGGLE_OPENED_ENABLED, siteId, enabled };
};

/**
 * Enables or disables the given shipping zone method.
 * @param {Number} siteId Site ID.
 * @param {Number|Object} methodId ID of the shipping method.
 * @param {Boolean} enabled Whether to enable (true) or disable (false) the shipping method.
 * @return {Object} Action object.
 */
export const toggleShippingZoneMethodEnabled = ( siteId, methodId, enabled ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_TOGGLE_ENABLED, siteId, methodId, enabled };
};
