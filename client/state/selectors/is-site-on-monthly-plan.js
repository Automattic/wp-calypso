import { isMonthly } from '@automattic/calypso-products';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';

/**
 * Returns true if site is on a monthly plan, false if the site is not
 * or if the site or plan is unknown.
 *
 * @param {Object} state Global state tree
 * @param {number} siteId Site ID
 * @returns {boolean} Whether site is on a monthly plan
 */
const isSiteOnMonthlyPlan = ( state, siteId ) => {
	const currentPlan = getCurrentPlan( state, siteId );

	if ( ! currentPlan ) {
		return false;
	}

	return isMonthly( currentPlan.productSlug );
};

export default isSiteOnMonthlyPlan;
