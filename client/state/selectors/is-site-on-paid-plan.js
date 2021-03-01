/**
 * Internal dependencies
 */
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { isFreePlan } from 'calypso/lib/plans';

/**
 * Returns true if site is on a paid plan, false if the site is not
 * or if the site or plan is unknown.
 *
 * @param {object} state Global state tree
 * @param {number} siteId Site ID
 * @returns {boolean} Whether site is on a paid plan
 */
const isSiteOnPaidPlan = ( state, siteId ) => {
	const currentPlan = getCurrentPlan( state, siteId );

	if ( ! currentPlan ) {
		return false;
	}

	return ! isFreePlan( currentPlan.productSlug );
};

export default isSiteOnPaidPlan;
