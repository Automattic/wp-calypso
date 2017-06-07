/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_PRODUCT_CREATE,
	WOOCOMMERCE_PRODUCT_UPDATED,
} from 'woocommerce/state/action-types';

/**
 * Action Creator: Create a new product
 *
 * @param {Number} siteId The id of the site upon which to create the product.
 * @param {Object} product The complete product object (may include a placeholder id)
 * @param {String} [successAction=undefined] Optional action object to be dispatched upon success.
 * @param {String} [errorAction=undefined] Optional action object to be dispatched upon error.
 * @return {Object} Action object
 */
export function createProduct( siteId, product, successAction = undefined, errorAction = undefined ) {
	const action = {
		type: WOOCOMMERCE_PRODUCT_CREATE,
		siteId,
		product,
	};

	if ( successAction ) {
		action.successAction = successAction;
	}

	if ( errorAction ) {
		action.errorAction = errorAction;
	}

	return action;
}

/**
 * Action Creator: Update local state that product has been updated.
 *
 * This action prompts the state to update itself after a product has been updated.
 *
 * @param {Number} siteId The id of the site to which the product belongs.
 * @param {Object} product The complete product object with which to update the state.
 * @return {Object} Action object
 */
export function productUpdated( siteId, product ) {
	return {
		type: WOOCOMMERCE_PRODUCT_UPDATED,
		payload: { // TODO: Remove this payload and place directly in action after the wc-api reducer is updated.
			siteId,
			product,
		}
	};
}

