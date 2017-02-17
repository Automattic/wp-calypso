/**
 * Internal dependencies
 */
import { getCurrentPlan } from 'state/sites/plans/selectors';
import { PLAN_FREE } from 'lib/plans/constants';

/**
 * Returns true if site is on a free plan, false if the site is not,
 * or null if the site is unknown.
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @return {?Boolean} Whether site is on a free plan
 */
const isSiteOnFreePlan = ( state, siteId ) => {
	const currentPlan = getCurrentPlan( state, siteId );

	if ( ! currentPlan ) {
		return null;
	}

	return currentPlan.productSlug === PLAN_FREE;
};

export default isSiteOnFreePlan;
