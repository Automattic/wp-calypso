/** @format */
/**
 * External dependencies
 */
import { get, find, isArray } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Gets product categories from API data.
 *
 * @param {Object} rootState Global state tree
 * @param {Number} [ siteId ] wpcom site id, if not provided, uses the selected site id.
 * @return {Array} List of product categories
 */
export function getProductCategories( rootState, siteId = getSelectedSiteId( rootState ) ) {
	const categories = get(
		rootState,
		[ 'extensions', 'woocommerce', 'sites', siteId, 'productCategories' ],
		[]
	);
	if ( ! isArray( categories ) ) {
		return [];
	}
	return categories;
}

/**
 * Gets product category fetched from API data.
 *
 * @param {Object} rootState Global state tree
 * @param {Number} categoryId The id of the category sought
 * @param {Number} siteId wpcom site id
 * @return {Object|null} Product category if found, otherwise null.
 */
export function getProductCategory(
	rootState,
	categoryId,
	siteId = getSelectedSiteId( rootState )
) {
	const categories = get(
		rootState,
		[ 'extensions', 'woocommerce', 'sites', siteId, 'productCategories' ],
		[]
	);
	if ( ! isArray( categories ) ) {
		return;
	}
	return find( categories, { id: categoryId } ) || null;
}
