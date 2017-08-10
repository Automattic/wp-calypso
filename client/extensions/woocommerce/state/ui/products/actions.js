/** @format */
/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_PRODUCT_ACTION_LIST_CREATE,
	WOOCOMMERCE_PRODUCT_ATTRIBUTE_EDIT,
	WOOCOMMERCE_PRODUCT_EDIT,
	WOOCOMMERCE_PRODUCT_EDIT_CLEAR,
} from 'woocommerce/state/action-types';

export function editProduct( siteId, product, data ) {
	return {
		type: WOOCOMMERCE_PRODUCT_EDIT,
		siteId,
		product,
		data,
	};
}

/**
 * Action Creator: Clear All Product Edits
 *
 * @param {Number} siteId The site for which to clear all product edits.
 * @return {Object} action
 */
export function clearProductEdits( siteId ) {
	return {
		type: WOOCOMMERCE_PRODUCT_EDIT_CLEAR,
		siteId,
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

export function editProductAddCategory( siteId, product, categoryId ) {
	const categories = [ ...product.categories, { id: categoryId } ];

	return editProduct( siteId, product, { categories } );
}

export function editProductRemoveCategory( siteId, product, categoryId ) {
	const categories = product.categories.filter( c => categoryId !== c.id );

	return editProduct( siteId, product, { categories } );
}

/**
 * Creates an action list to save product-related edits.
 *
 * Saves products, variations, and product categories.
 * @param {Object} [successAction] Action to be dispatched upon successful completion.
 * @param {Object} [failureAction] Action to be dispatched upon failure of execution.
 * @return {Function} action
 */
export function createProductActionList( successAction, failureAction ) {
	return {
		type: WOOCOMMERCE_PRODUCT_ACTION_LIST_CREATE,
		successAction,
		failureAction,
	};
}
