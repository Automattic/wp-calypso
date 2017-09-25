/** @format */
/**
 * Internal dependencies
 */
import { isFreePlan } from 'lib/plans';
import { getCurrentPlan } from 'state/sites/plans/selectors';

/**
 * Returns true if site is on a paid plan, false if the site is not
 * or if the site or plan is unknown.
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @return {Boolean} Whether site is on a paid plan
 */
const isSiteOnPaidPlan = ( state, siteId ) => {
	const currentPlan = getCurrentPlan( state, siteId );

	if ( ! currentPlan ) {
		return false;
	}

	return ! isFreePlan( currentPlan.productSlug );
};

export default isSiteOnPaidPlan;
