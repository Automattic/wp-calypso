/** @format */

/**
 * Internal dependencies
 */
import { getNormalizedProductCategoriesQuery } from './utils';
import {
	WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
	WOOCOMMERCE_PRODUCT_CATEGORY_CREATE,
	WOOCOMMERCE_PRODUCT_CATEGORY_UPDATED,
} from 'woocommerce/state/action-types';

export function fetchProductCategories( siteId, query = {} ) {
	const normalizedQuery = getNormalizedProductCategoriesQuery( query );
	return dispatch => {
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
 * @param {Number} siteId The id of the site upon which to create.
 * @param {Object} category The product category object (may include a placeholder id).
 * @param {Object|Function} [successAction] action with extra props { sentData, receivedData }
 * @param {Object|Function} [failureAction] action with extra props { error }
 * @return {Object} Action object
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
 * Action Creator: This action prompts the state to update itself after a product category has changed.
 *
 * @param {Number} siteId The id of the site to which the category belongs.
 * @param {Object} data The complete product category object with which to update the state.
 * @param {Object} originatingAction The action that precipitated this update.
 * @return {Object} Action object
 */
export function productCategoryUpdated( siteId, data, originatingAction ) {
	return {
		type: WOOCOMMERCE_PRODUCT_CATEGORY_UPDATED,
		siteId,
		data,
		originatingAction,
	};
}
