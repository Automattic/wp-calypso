/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_EDIT_PRODUCT_VARIATION,
	WOOCOMMERCE_UPDATE_PRODUCT_VARIATIONS,
} from '../../../action-types';

/**
 * Edits a product variation.
 * This adds the variation to the edit state.
 *
 * @param {object} product The product to which the variation should belong.
 * @param {object} variation The variation to be edited, or null if new.
 * @param {object} data The fields to be edited and values for them.
 * @return {object} the action to be dispatched.
 */
export function editProductVariation( product, variation, data ) {
	return {
		type: WOOCOMMERCE_EDIT_PRODUCT_VARIATION,
		payload: { product, variation, data },
	};
}

/**
 * Updates a product's avaiable variations based on the structure (attributes and selected options)
 * of variations passed in. It will drop variations that are no longer valid,
 * and add new variations that are missing. It preserves existing valid combinations.
 *
 * @see lib/generate-variations
 * @param {object} product The product to which the variations should belong.
 * @param {array} existingVariations Array of existing variation objects so existing valid entries can be perserved.
 * @param {array} variations Array of new possible variation objects.
 * @return {object} the action to be dispatched.
 */
export function updateProductVariations( product, existingVariations, variations ) {
	return {
		type: WOOCOMMERCE_UPDATE_PRODUCT_VARIATIONS,
		payload: { product, existingVariations, variations },
	};
}
