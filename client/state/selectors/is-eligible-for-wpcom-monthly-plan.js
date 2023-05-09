import { isWpComMonthlyPlan, isWpComFreePlan } from '@automattic/calypso-products';
import { createSelector } from '@automattic/state-utils';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
/**
 * Return true if the site is eligible for a monthly plan on WPCOM.
 *
 * @param {Object} state the global state tree
 * @param {number} siteId the ID of the site to check.
 * @returns {boolean} Whether the site is eligible for a monthly plan.
 */
export default createSelector(
	( state, siteId = getSelectedSiteId( state ) ) => {
		if ( ! siteId ) {
			return true;
		}

		const currentPlanSlug = getCurrentPlan( state, siteId )?.productSlug;
		if ( typeof currentPlanSlug === 'undefined' ) {
			return true;
		}

		return isWpComMonthlyPlan( currentPlanSlug ) || isWpComFreePlan( currentPlanSlug );
	},
	( state, siteId = getSelectedSiteId( state ) ) => [
		isAtomicSite( state, siteId ),
		getCurrentPlan( state, siteId ),
	]
);
