/**
 * Gets product categories from API data.
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId wpcom site id
 * @return {Array} List of product categories
 */
export function getProductCategories( state, siteId ) {
	const sites = state.extensions.woocommerce.sites || {};
	const siteData = sites[ siteId ] || {};

	return siteData.productCategories || [];
}
