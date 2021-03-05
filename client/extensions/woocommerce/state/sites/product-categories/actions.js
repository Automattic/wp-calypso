/**
 * Internal dependencies
 */
import { getNormalizedProductCategoriesQuery } from './utils';
import {
	WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
	WOOCOMMERCE_PRODUCT_CATEGORY_CREATE,
	WOOCOMMERCE_PRODUCT_CATEGORY_UPDATE,
	WOOCOMMERCE_PRODUCT_CATEGORY_UPDATED,
	WOOCOMMERCE_PRODUCT_CATEGORY_DELETE,
} from 'woocommerce/state/action-types';

export function fetchProductCategories( siteId, query = {} ) {
	const normalizedQuery = getNormalizedProductCategoriesQuery( query );
	return ( dispatch ) => {
		const getAction = {
			type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
			siteId,
			query: normalizedQuery,
		};

		dispatch( getAction );
	};
}

/**
 * Action Creator: Create a new product category.
 *
 * @param {number} siteId The id of the site upon which to create.
 * @param {object} category The product category object (may include a placeholder id).
 * @param {object|Function} [successAction] action with extra props { sentData, receivedData }
 * @param {object|Function} [failureAction] action with extra props { error }
 * @returns {object} Action object
 */
export function createProductCategory( siteId, category, successAction, failureAction ) {
	// TODO: Error action if not valid?

	const action = {
		type: WOOCOMMERCE_PRODUCT_CATEGORY_CREATE,
		siteId,
		category,
		successAction,
		failureAction,
	};

	return action;
}

/**
 * Action Creator: Update a product category.
 *
 * @param {number} siteId The id of the site upon which to create.
 * @param {object} category The product category object.
 * @param {object|Function} [successAction] action with extra props { sentData, receivedData }
 * @param {object|Function} [failureAction] action with extra props { error }
 * @returns {object} Action object
 */
export function updateProductCategory( siteId, category, successAction, failureAction ) {
	const action = {
		type: WOOCOMMERCE_PRODUCT_CATEGORY_UPDATE,
		siteId,
		category,
		successAction,
		failureAction,
	};

	return action;
}

/**
 * Action Creator: Delete a product category.
 *
 * @param {number} siteId The id of the site upon which to delete.
 * @param {object} category The product category object.
 * @param {object|Function} [successAction] action with extra props { sentData, receivedData }
 * @param {object|Function} [failureAction] action with extra props { error }
 * @returns {object} Action object
 */
export function deleteProductCategory( siteId, category, successAction, failureAction ) {
	return {
		type: WOOCOMMERCE_PRODUCT_CATEGORY_DELETE,
		siteId,
		category,
		successAction,
		failureAction,
	};
}

/**
 * Action Creator: This action prompts the state to update itself after a product category has changed.
 *
 * @param {number} siteId The id of the site to which the category belongs.
 * @param {object} data The complete product category object with which to update the state.
 * @param {object} originatingAction The action that precipitated this update.
 * @returns {object} Action object
 */
export function productCategoryUpdated( siteId, data, originatingAction ) {
	return {
		type: WOOCOMMERCE_PRODUCT_CATEGORY_UPDATED,
		siteId,
		data,
		originatingAction,
	};
}
