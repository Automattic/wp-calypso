/**
 * Internal dependencies
 */
import { createSelector } from '@automattic/state-utils';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { isWpComMonthlyPlan, isWpComFreePlan } from '@automattic/calypso-products';
/**
 * Return true if the site is eligible for a monthly plan on WPCOM.
 *
 * @param {object} state the global state tree
 * @param {number} siteId the ID of the site to check.
 * @returns {boolean} Whether the site is eligible for a monthly plan.
 */
export default createSelector(
	( state, siteId = getSelectedSiteId( state ) ) => {
		if ( ! siteId ) {
			return true;
		}

		const currentPlanSlug = getCurrentPlan( state, siteId )?.productSlug;

		return (
			( isAtomicSite( state, siteId ) && currentPlanSlug === 'jetpack_free' ) ||
			isWpComMonthlyPlan( currentPlanSlug ) ||
			isWpComFreePlan( currentPlanSlug )
		);
	},
	( state, siteId = getSelectedSiteId( state ) ) => [
		isAtomicSite( state, siteId ),
		getCurrentPlan( state, siteId ),
	]
);
