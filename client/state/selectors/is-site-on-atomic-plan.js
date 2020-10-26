/**
 * Internal dependencies
 */
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { isEcommercePlan, isBusinessPlan } from 'calypso/lib/plans';

/**
 * Returns true if site is on a paid plan that is eligible to be an Atomic site,
 * false if not, or if the site or plan is unknown.
 *
 * @param {object} state Global state tree
 * @param {number} siteId Site ID
 * @returns {boolean} Whether site is on an atomic paid plan
 */
const isSiteOnAtomicPlan = ( state, siteId ) => {
	const currentPlan = getCurrentPlan( state, siteId );

	if ( ! currentPlan ) {
		return false;
	}

	return isEcommercePlan( currentPlan.productSlug ) || isBusinessPlan( currentPlan.productSlug );
};

export default isSiteOnAtomicPlan;
