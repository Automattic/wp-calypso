/** @format */

/**
 * Internal dependencies
 */

import {
	WOOCOMMERCE_PRODUCT_VARIATION_EDIT,
	WOOCOMMERCE_PRODUCT_VARIATION_EDIT_CLEAR,
} from 'client/extensions/woocommerce/state/action-types';

/**
 * Edits a product variation.
 * This adds the variation to the edit state.
 *
 * @param {Number} siteId Site ID.
 * @param {object} product The product to which the variation should belong.
 * @param {object} variation The variation to be edited, or null if new.
 * @param {object} data The fields to be edited and values for them.
 * @return {object} the action to be dispatched.
 */
export function editProductVariation( siteId, product, variation, data ) {
	return {
		type: WOOCOMMERCE_PRODUCT_VARIATION_EDIT,
		siteId,
		product,
		variation,
		data,
	};
}

/**
 * Action Creator: Clear All Product Variation Edits
 *
 * @param {Number} siteId The site for which to clear all product variation edits.
 * @return {Object} action
 */
export function clearProductVariationEdits( siteId ) {
	return {
		type: WOOCOMMERCE_PRODUCT_VARIATION_EDIT_CLEAR,
		siteId,
	};
}
