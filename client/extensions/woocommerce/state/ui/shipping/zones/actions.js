/**
 * Internal dependencies
 */

import {
	WOOCOMMERCE_SHIPPING_ZONE_ADD,
	WOOCOMMERCE_SHIPPING_ZONE_ACTION_LIST_CREATE_DELETE,
	WOOCOMMERCE_SHIPPING_ZONE_ACTION_LIST_CREATE_SAVE,
	WOOCOMMERCE_SHIPPING_ZONE_CANCEL,
	WOOCOMMERCE_SHIPPING_ZONE_CLOSE,
	WOOCOMMERCE_SHIPPING_ZONE_DEFAULT_ACTION_LIST_CREATE,
	WOOCOMMERCE_SHIPPING_ZONE_EDIT_NAME,
	WOOCOMMERCE_SHIPPING_ZONE_OPEN,
	WOOCOMMERCE_SHIPPING_ZONE_REMOVE,
} from 'woocommerce/state/action-types';

/**
 * Creates a new (empty) Shipping Zone. This will open the newly created zone for editing, but the zone itself
 * won't be saved into "permanent" state until `closeEditingShippingZone` is called.
 *
 * @param {number} siteId Site ID.
 * @returns {object} Action object.
 */
export const addNewShippingZone = ( siteId ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_ADD, siteId };
};

/**
 * Opens the given Shipping Zone for editing it.
 *
 * @param {number} siteId Site ID.
 * @param {number} id Shipping Zone ID to open.
 * @returns {object} Action object.
 */
export const openShippingZoneForEdit = ( siteId, id ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_OPEN, siteId, id };
};

/**
 * Saves the changes made to the Shipping Zone currently being edited, and stops editing it.
 *
 * @param {number} siteId Site ID.
 * @returns {object} Action object.
 */
export const closeEditingShippingZone = ( siteId ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_CLOSE, siteId };
};

/**
 * Stops editing the Shipping Zone currently being edited, discarding all the changes made to it since the modal
 * was opened.
 *
 * @param {number} siteId Site ID.
 * @returns {object} Action object.
 */
export const cancelEditingShippingZone = ( siteId ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_CANCEL, siteId };
};

/**
 * Changes the name of the Shipping Zone currently being edited.
 *
 * @param {number} siteId Site ID.
 * @param {string} name New name for the Shipping Zone.
 * @returns {object} Action object.
 */
export const changeShippingZoneName = ( siteId, name ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_EDIT_NAME, siteId, name };
};

/**
 * Deletes the given Shipping Zone. Note that this action (as any other in this file) won't trigger any request
 * to the server.
 *
 * @param {number} siteId Site ID.
 * @param {number} id Shipping Zone ID to delete.
 * @returns {object} Action object.
 */
export const deleteShippingZone = ( siteId, id ) => {
	return { type: WOOCOMMERCE_SHIPPING_ZONE_REMOVE, siteId, id };
};

/**
 * Creates an action list to save shipping-zone-related edits.
 *
 * Saves the shipping zone, its shipping methods and its locations.
 *
 * @param {Function} [successAction] Action to be dispatched upon successful completion.
 * @param {Function} [failureAction] Action to be dispatched upon failure of execution.
 * @param {Function} [locationsFailAction] Action to be dispatched upon failure of execution.
 * @param {Function} [methodsFailAction] Action to be dispatched upon failure of execution.
 * @returns {object} Action object.
 */
export function createShippingZoneSaveActionList(
	successAction,
	failureAction,
	locationsFailAction,
	methodsFailAction
) {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_ACTION_LIST_CREATE_SAVE,
		successAction,
		failureAction,
		locationsFailAction,
		methodsFailAction,
	};
}

/**
 * Creates an action list to delete a shipping zone.
 *
 * Deletes the shipping zone, its shipping methods and its locations.
 *
 * @param {Function} [successAction] Action to be dispatched upon successful completion.
 * @param {Function} [failureAction] Action to be dispatched upon failure of execution.
 * @returns {object} Action object.
 */
export function createShippingZoneDeleteActionList( successAction, failureAction ) {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_ACTION_LIST_CREATE_DELETE,
		successAction,
		failureAction,
	};
}

/**
 * Creates an action list to create the default Shipping Zones settings for a new store.
 *
 * @returns {object} Action object.
 */
export function createAddDefultShippingZoneActionList() {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_DEFAULT_ACTION_LIST_CREATE,
	};
}
