
/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_PRODUCT_VARIATION_CREATE,
	WOOCOMMERCE_PRODUCT_VARIATION_UPDATED,
} from 'woocommerce/state/action-types';

/**
 * Action Creator: Create a new product variation.
 *
 * @param {Number} siteId The id of the site in which the variation's product exists.
 * @param {Number|Object} productId The id of the product for which this variation will be created
 *                                  (could be a placeholder id if product is not yet created).
 * @param {Object} variation The complete variation object to be created.
 * @param {Object|Function} [successAction] Optional action to be dispatched upon success.
 * @param {Object|Function} [failureAction] Optional action to be dispatched upon error.
 * @return {Object} Action object
 */
export function createProductVariation( siteId, productId, variation, successAction, failureAction ) {
	return {
		type: WOOCOMMERCE_PRODUCT_VARIATION_CREATE,
		siteId,
		productId,
		variation,
		successAction,
		failureAction,
	};
}

/**
 * Action Creator: Update local state the variation has been updated.
 *
 * This action prompts the state to update itself after a variation has been updated.
 *
 * @param {Number} siteId The id of the site in which the variation's product exists.
 * @param {Number} productId The id of the product to which this variation belongs.
 * @param {Object} data The complete variation object with which to update the state.
 * @param {Object} originatingAction The action which was the source of this update.
 * @return {Object} Action object
 */
export function productVariationUpdated( siteId, productId, data, originatingAction ) {
	return {
		type: WOOCOMMERCE_PRODUCT_VARIATION_UPDATED,
		siteId,
		data,
		originatingAction,
	};
}

