/**
 * Gets payment currency from API data.
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId wpcom site id
 * @return {Object} Payment Currency
 */
export function getPaymentCurrency( state, siteId ) {
	const wcApi = state.extensions.woocommerce.wcApi || {};
	const siteData = wcApi[ siteId ] || {};

	return siteData.currency || {};
}
