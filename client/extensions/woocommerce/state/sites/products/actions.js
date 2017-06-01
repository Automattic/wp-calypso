/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_API_CREATE_PRODUCT,
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
		type: WOOCOMMERCE_API_CREATE_PRODUCT,
		payload: { siteId, product },
	};

	if ( successAction ) {
		action.payload.successAction = successAction;
	}

	if ( errorAction ) {
		action.payload.errorAction = errorAction;
	}

	return action;
}

