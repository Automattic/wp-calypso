/**
 * Internal dependencies
 */

import { GOOGLE_CREDITS } from './service-types';

/**
 * Return site vouchers getting from state object and
 * the given siteId
 *
 * @param {object} state - current state object
 * @param {number} siteId - site identificator
 * @returns {Array} site vouchers
 */
export const getVouchersBySiteId = ( state, siteId ) => {
	if ( ! siteId ) {
		return [];
	}

	return state.sites.vouchers.items[ siteId ] || [];
};

/**
 * Return site vouchers getting from state object and
 * the given site object
 *
 * @param {object} state - current state object
 * @param {object} site - site object
 * @returns {Array} site vouchers
 */
export const getVouchersBySite = ( state, site ) => {
	if ( ! site ) {
		return [];
	}
	return getVouchersBySiteId( state, site.ID );
};

export const getVouchersBySiteIdAndServiceType = ( state, siteId, serviceType ) => {
	return getVouchersBySiteId( state, siteId )[ serviceType ] || [];
};

/**
 * Return google-credits vouchers
 *
 * @param {object} state - current state object
 * @param {object} site - site object
 * @returns {Array} site vouchers
 */

export const getGoogleAdCredits = ( state, site ) => {
	const vouchers = getVouchersBySite( state, site );
	return vouchers[ GOOGLE_CREDITS ] || [];
};

/**
 * Return requesting state for the given site
 *
 * @param {object} state - current state object
 * @param {number} siteId - site identifier
 * @returns {boolean} is site-vouchers requesting?
 */
export const isRequestingSiteVouchers = ( state, siteId ) => {
	return state.sites.vouchers.requesting[ siteId ] || false;
};

/**
 * Return assign requesting state for the given site
 * and serviceType
 *
 * @param {object} state - current state object
 * @param {number} siteId - site identifier
 * @param {string} serviceType - service type
 * @returns {boolean} true if a voucher is being assigned
 */
export const isAssigningSiteVoucher = ( state, siteId, serviceType ) => {
	const requesting = state.sites.vouchers.requesting[ siteId ];
	return requesting ? requesting[ serviceType ] : false;
};
