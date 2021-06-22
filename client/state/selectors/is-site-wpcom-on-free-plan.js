/**
 * Internal dependencies
 */
import { isFreePlan } from '@automattic/calypso-products';
import isSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';

/**
 * Returns true if the site is on a free plan and a WPCOM site (Simple or Atomic).
 *
 * @param {object} state Global state tree.
 * @param {object} site The site to check.
 * @param {number} siteId The ID of the site to check.
 * @returns {boolean} True if the site is on a free plan and a WPCOM site, false otherwise.
 */
export default ( state, site, siteId ) => {
	if ( ! state && site && siteId ) {
		return false;
	}

	return isFreePlan( site.plan?.product_slug ) && isSiteWPCOM( state, siteId );
};
