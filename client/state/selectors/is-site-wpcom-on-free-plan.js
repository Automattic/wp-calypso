/**
 * Internal dependencies
 */
import { isFreePlan } from '@automattic/calypso-products';
import isSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Returns true if the site is on a free plan and a WPCOM site (Simple or Atomic).
 *
 * @param {object} state Global state tree.
 * @param {number} siteId The ID of the site to check.
 * @returns {boolean} True if the site is on a free plan and a WPCOM site, false otherwise.
 */
export default ( state, siteId = getSelectedSiteId( state ) ) => {
	if ( ! state && siteId ) {
		return false;
	}

	const site = getSelectedSite( state );

	return isFreePlan( site?.plan?.product_slug ) && isSiteWPCOM( state, siteId );
};
