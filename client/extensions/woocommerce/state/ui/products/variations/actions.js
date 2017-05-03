/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_EDIT_PRODUCT_VARIATION,
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
