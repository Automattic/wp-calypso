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

/**
 * Creates a new (empty) Shipping Zone. This will open the newly created zone for editing, but the zone itself
 * won't be saved into "permanent" state until `closeEditingShippingZone` is called.
 * @param {Number} siteId Site ID.
 * @return {Object} Action object.
 */
export const addNewShippingZone = ( siteId ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_ADD, siteId };
};

/**
 * Opens the given Shipping Zone for editing it.
 * @param {Number} siteId Site ID.
 * @param {Number} id Shipping Zone ID to open.
 * @return {Object} Action object.
 */
export const openShippingZoneForEdit = ( siteId, id ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_OPEN, siteId, id };
};

/**
 * Saves the changes made to the Shipping Zone currently being edited, and stops editing it.
 * @param {Number} siteId Site ID.
 * @return {Object} Action object.
 */
export const closeEditingShippingZone = ( siteId ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_CLOSE, siteId };
};

/**
 * Stops editing the Shipping Zone currently being edited, discarding all the changes made to it since the modal
 * was opened.
 * @param {Number} siteId Site ID.
 * @return {Object} Action object.
 */
export const cancelEditingShippingZone = ( siteId ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_CANCEL, siteId };
};

/**
 * Changes the name of the Shipping Zone currently being edited.
 * @param {Number} siteId Site ID.
 * @param {String} name New name for the Shipping Zone.
 * @return {Object} Action object.
 */
export const changeShippingZoneName = ( siteId, name ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_EDIT_NAME, siteId, name };
};

/**
 * Deletes the given Shipping Zone. Note that this action (as any other in this file) won't trigger any request
 * to the server.
 * @param {Number} siteId Site ID.
 * @param {Number} id Shipping Zone ID to delete.
 * @return {Object} Action object.
 */
export const deleteShippingZone = ( siteId, id ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_REMOVE, siteId, id };
};
