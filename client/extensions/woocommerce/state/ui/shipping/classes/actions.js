/** @format */

/**
 * Internal dependencies
 */

import {
	WOOCOMMERCE_SHIPPING_CLASS_EDIT,
	WOOCOMMERCE_SHIPPING_CLASS_CLOSE,
	WOOCOMMERCE_SHIPPING_CLASS_ADD,
	WOOCOMMERCE_SHIPPING_CLASS_CHANGE,
	WOOCOMMERCE_SHIPPING_CLASS_SAVE,
	WOOCOMMERCE_SHIPPING_CLASS_REMOVE,
	WOOCOMMERCE_SHIPPING_CLASSES_ACTION_LIST_CREATE,
} from 'woocommerce/state/action-types';

/**
 * Enters an editing state for the given shipping class.
 *
 * @param  {number} siteId  Site ID.
 * @param  {number} classId The ID of the shipping class to edit.
 * @return {Object}         Action object.
 */
export const editShippingClass = ( siteId, classId ) => {
	return { type: WOOCOMMERCE_SHIPPING_CLASS_EDIT, siteId, classId };
};

/**
 * Closes the popup for the currently edited shipping class, new or existing.
 *
 * @param  {number} siteId Site ID.
 * @return {Object}        Action object.
 */
export const closeShippingClass = siteId => {
	return { type: WOOCOMMERCE_SHIPPING_CLASS_CLOSE, siteId };
};

/**
 * Opens a modal in order to allow a new shipping class to be created.
 *
 * @param  {number} siteId Site ID.
 * @return {Object}        Action object.
 */
export const addShippingClass = siteId => {
	return { type: WOOCOMMERCE_SHIPPING_CLASS_ADD, siteId };
};

/**
 * Saves the changes of an individual shipping class setting.
 *
 * @param  {number} siteId Site ID.
 * @param  {string} field  The name of the edited field.
 * @param  {*}      value  The new value of the field.
 * @return {Object}        Action object.
 */
export const updateShippingClassSetting = ( siteId, field, value ) => {
	return { type: WOOCOMMERCE_SHIPPING_CLASS_CHANGE, siteId, field, value };
};

/**
 * Saves the changes mdate in the currently open shipping class modal.
 *
 * @param  {number} siteId Site ID.
 * @return {Object}        Action object.
 */
export const saveCurrentlyOpenShippingClass = siteId => {
	return { type: WOOCOMMERCE_SHIPPING_CLASS_SAVE, siteId };
};

/**
 * Initiates the saving actions list for shipping classes.
 *
 * @param  {number} siteId        Site ID.
 * @param  {Object} successAction An action object to be dispatched on success.
 * @param  {Object} failureAction An action object to be dispatched on failure.
 * @return {Object}               The full action object.
 */
export const createShippingClassesSaveActionList = ( siteId, successAction, failureAction ) => {
	return {
		type: WOOCOMMERCE_SHIPPING_CLASSES_ACTION_LIST_CREATE,
		siteId,
		successAction,
		failureAction,
	};
};

/**
 * Removes a shipping class from the UI and marks it for deletion.
 *
 * @param  {number} siteId  Site ID.
 * @param  {number} classId The ID of the shipping class ID.
 * @return {Object}         The full action object.
 */
export const removeShippingClass = ( siteId, classId ) => {
	return {
		type: WOOCOMMERCE_SHIPPING_CLASS_REMOVE,
		siteId,
		classId,
	};
};
