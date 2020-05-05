/**
 * Internal dependencies
 */

import {
	WOOCOMMERCE_PRODUCT_VARIATION_CREATE,
	WOOCOMMERCE_PRODUCT_VARIATION_DELETE,
	WOOCOMMERCE_PRODUCT_VARIATION_UPDATE,
	WOOCOMMERCE_PRODUCT_VARIATION_UPDATED,
	WOOCOMMERCE_PRODUCT_VARIATIONS_REQUEST,
} from 'woocommerce/state/action-types';

/**
 * Action Creator: Fetch a product's variations.
 *
 * @param {number} siteId The id of the site in which the variation's product exists.
 * @param {number} productId The id of the product.
 * @param {object|Function} [successAction] Action with extra props { productId, sentData, receivedData }
 * @param {object|Function} [failureAction] Action with extra props { error }
 * @returns {object} Action object
 */
export function fetchProductVariations( siteId, productId, successAction, failureAction ) {
	return {
		type: WOOCOMMERCE_PRODUCT_VARIATIONS_REQUEST,
		siteId,
		productId,
		successAction,
		failureAction,
	};
}

/**
 * Action Creator: Create a new product variation.
 *
 * @param {number} siteId The id of the site in which the variation's product exists.
 * @param {number|object} productId The id of the product for which this variation will be created
 *                                  (could be a placeholder id if product is not yet created).
 * @param {object} variation The complete variation object to be created.
 * @param {object|Function} [successAction] Action with extra props { productId, sentData, receivedData }
 * @param {object|Function} [failureAction] Action with extra props { error }
 * @returns {object} Action object
 */
export function createProductVariation(
	siteId,
	productId,
	variation,
	successAction,
	failureAction
) {
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
 * Action Creator: Update an existing product variation.
 *
 * @param {number} siteId The id of the site in which the variation's product exists.
 * @param {number} productId The id of the product for which this variation.
 * @param {object} variation The variation data to be updated (must include id).
 * @param {object|Function} [successAction] Action with extra props { productId, sentData, receivedData }
 * @param {object|Function} [failureAction] Action with extra props { error }
 * @returns {object} Action object
 */
export function updateProductVariation(
	siteId,
	productId,
	variation,
	successAction,
	failureAction
) {
	return {
		type: WOOCOMMERCE_PRODUCT_VARIATION_UPDATE,
		siteId,
		productId,
		variation,
		successAction,
		failureAction,
	};
}

/**
 * Action Creator: Delete an existing product variation.
 *
 * @param {number} siteId The id of the site in which the variation's product exists.
 * @param {number} productId The id of the product to which this variation belongs.
 * @param {object} variationId The id of the variation to be deleted.
 * @param {object|Function} [successAction] Action with extra props { productId, sentData, receivedData }
 * @param {object|Function} [failureAction] Action with extra props { error }
 * @returns {object} Action object
 */
export function deleteProductVariation(
	siteId,
	productId,
	variationId,
	successAction,
	failureAction
) {
	return {
		type: WOOCOMMERCE_PRODUCT_VARIATION_DELETE,
		siteId,
		productId,
		variationId,
		successAction,
		failureAction,
	};
}

/**
 * Action Creator: Update local state the variation has been updated.
 *
 * This action prompts the state to update itself after a variation has been updated.
 *
 * @param {number} siteId The id of the site in which the variation's product exists.
 * @param {number} productId The id of the product to which this variation belongs.
 * @param {object} data The complete variation object with which to update the state.
 * @param {object} originatingAction The action which was the source of this update.
 * @returns {object} Action object
 */
export function productVariationUpdated( siteId, productId, data, originatingAction ) {
	return {
		type: WOOCOMMERCE_PRODUCT_VARIATION_UPDATED,
		siteId,
		productId,
		data,
		originatingAction,
	};
}
