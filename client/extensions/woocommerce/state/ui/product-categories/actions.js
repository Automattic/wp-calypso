/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_PRODUCT_CATEGORY_EDIT,
} from 'woocommerce/state/action-types';

/**
 * Action creator: Edit a product category
 *
 * @param {Number} siteId The id of the site to which the category belongs.
 * @param {Object} category The unedited version of the category object.
 * @param {Object} data An object containing the properties to be edited for the object.
 * @return {Object} The action object.
 */
export function editProductCategory( siteId, category, data ) {
	return {
		type: WOOCOMMERCE_PRODUCT_CATEGORY_EDIT,
		siteId,
		category,
		data,
	};
}
