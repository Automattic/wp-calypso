/** @format */

/**
 * External dependencies
 */

import impureLodash from 'lib/impure-lodash';
const { uniqueId } = impureLodash;

/**
 * Internal dependencies
 */

import {
	WOOCOMMERCE_SHIPPING_CLASS_EDIT,
	WOOCOMMERCE_SHIPPING_CLASS_CLOSE,
	WOOCOMMERCE_SHIPPING_CLASS_ADD,
	WOOCOMMERCE_SHIPPING_CLASS_CHANGE,
	WOOCOMMERCE_SHIPPING_CLASS_UPDATE,
	WOOCOMMERCE_SHIPPING_CLASS_CREATE,
} from 'woocommerce/state/action-types';

/**
 * Enters an editing state for the given shipping class.
 *
 * @param {Number} siteId Site ID.
 * @param {Number} classId The ID of the shipping class to edit.
 * @return {Object} Action object.
 */
export const editShippingClass = ( siteId, classId ) => {
	return { type: WOOCOMMERCE_SHIPPING_CLASS_EDIT, siteId, classId };
};

export const closeShippingClass = siteId => {
	return { type: WOOCOMMERCE_SHIPPING_CLASS_CLOSE, siteId };
};

export const addShippingClass = siteId => {
	return { type: WOOCOMMERCE_SHIPPING_CLASS_ADD, siteId };
};

export const updateShippingClassField = ( siteId, field, value ) => {
	return { type: WOOCOMMERCE_SHIPPING_CLASS_CHANGE, siteId, field, value };
};

export const saveCurrentlyOpenShippingClass = ( siteId, { isNew, id, data, changes } ) => {
	if ( isNew ) {
		return {
			type: WOOCOMMERCE_SHIPPING_CLASS_CREATE,
			siteId,
			data,
			temporaryId: 'saving-' + uniqueId(),
		};
	}

	return {
		type: WOOCOMMERCE_SHIPPING_CLASS_UPDATE,
		siteId,
		id,
		changes,
	};
};
