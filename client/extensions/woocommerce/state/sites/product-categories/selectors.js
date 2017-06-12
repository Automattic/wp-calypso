/**
 * External dependencies
 */
import { get, isArray } from 'lodash';

/**
 * Gets product categories from API data.
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId wpcom site id
 * @return {Array} List of product categories
 */
export function getProductCategories( state, siteId ) {
	const categories = get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'productCategories' ], [] );
	if ( ! isArray( categories ) ) {
		return [];
	}
	return categories;
}
