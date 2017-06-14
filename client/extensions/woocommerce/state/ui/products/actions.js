/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_PRODUCT_ACTION_LIST_CREATE,
	WOOCOMMERCE_PRODUCT_ATTRIBUTE_EDIT,
	WOOCOMMERCE_PRODUCT_EDIT,
} from 'woocommerce/state/action-types';

export function editProduct( siteId, product, data ) {
	return {
		type: WOOCOMMERCE_PRODUCT_EDIT,
		siteId,
		product,
		data,
	};
}

export function editProductAttribute( siteId, product, attribute, data ) {
	return {
		type: WOOCOMMERCE_PRODUCT_ATTRIBUTE_EDIT,
		siteId,
		product,
		attribute,
		data,
	};
}

/**
 * Creates an action list to save product-related edits.
 *
 * Saves products, variations, and product categories.
 * @return {Function} action
 */
export function createProductActionList() {
	return {
		type: WOOCOMMERCE_PRODUCT_ACTION_LIST_CREATE,
	};
}

