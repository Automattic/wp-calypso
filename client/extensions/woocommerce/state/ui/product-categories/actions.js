/**
 * External dependencies
 */

import { uniqueId } from 'lodash';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_PRODUCT_CATEGORY_EDIT,
	WOOCOMMERCE_PRODUCT_CATEGORY_EDIT_CLEAR,
} from 'woocommerce/state/action-types';

/**
 * Generates a new product category placeholder ID
 * This is used for new creates.
 *
 * @returns {object} A new unique placeholder ID.
 */
export function generateProductCategoryId() {
	return { placeholder: uniqueId( 'productCategory_' ) };
}

/**
 * Action creator: Edit a product category
 *
 * @param {number} siteId The id of the site to which the category belongs.
 * @param {object} [category] The most recent version of the category object, or null if new.
 * @param {object} data An object containing the properties to be edited for the object, if null, the category will be removed.
 * @returns {object} The action object.
 */
export function editProductCategory( siteId, category, data ) {
	return {
		type: WOOCOMMERCE_PRODUCT_CATEGORY_EDIT,
		siteId,
		category: category || { id: generateProductCategoryId() },
		data,
	};
}

/**
 * Action Creator: Clear All Product Category Edits
 *
 * @param {number} siteId The site for which to clear all product category edits.
 * @returns {object} action
 */
export function clearProductCategoryEdits( siteId ) {
	return {
		type: WOOCOMMERCE_PRODUCT_CATEGORY_EDIT_CLEAR,
		siteId,
	};
}
