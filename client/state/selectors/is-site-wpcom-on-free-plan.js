/**
 * Internal dependencies
 */
import { isFreePlan } from '@automattic/calypso-products';
import { createSelector } from 'calypso/../packages/state-utils/src';
import isSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';

/**
 * Returns true if the site is on a free plan and a WPCOM site (Simple or Atomic).
 *
 * @param {object} state Global state tree.
 * @param {number} siteId The ID of the site to check.
 * @returns {boolean} True if the site is on a free plan and a WPCOM site, false otherwise.
 */
export default createSelector(
	( state, siteId = getSelectedSiteId( state ) ) => {
		const currentPlanSlug = getCurrentPlan( state, siteId )?.productSlug;

		return isFreePlan( currentPlanSlug ) && isSiteWPCOM( state, siteId );
	},
	( state, siteId = getSelectedSiteId( state ) ) => [
		getCurrentPlan( state, siteId ),
		isSiteWPCOM( state, siteId ),
	]
);
