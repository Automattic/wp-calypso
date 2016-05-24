/**
 * Return site vouchers getting from state object and
 * the given siteId
 *
 * @param {Object} state - current state object
 * @param {Number} siteId - site identificator
 * @return {Array} site vouchers
 */
export const getVouchersBySiteId = ( state, siteId ) => {
	if ( ! siteId ) {
		return [];
	}

	const { items } = state.sites.vouchers;
	return items[ siteId ] || [];
};

/**
 * Return site vouchers getting from state object and
 * the given site object
 *
 * @param {Object} state - current state object
 * @param {Object} site - site object
 * @return {Array} site vouchers
 */
export const getVouchersBySite = ( state, site ) => {
	if ( ! site ) {
		return [];
	}
	return getVouchersBySiteId( state, site.ID );
};

/**
 * Return requesting state for the given site
 *
 * @param {Object} state - current state object
 * @param {Number} siteId - site identifier
 * @return {Boolean} is site-vouchers requesting?
 */
export const isRequestingSiteVouchers = ( state, siteId ) => {
	const { requesting } = state.sites.vouchers;
	return requesting[ siteId ] || false;
};
