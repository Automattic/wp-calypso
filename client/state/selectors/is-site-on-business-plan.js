/**
 * Internal dependencies
 */
import { getCurrentPlan } from 'state/sites/plans/selectors';
import { isBusinessPlan } from 'lib/plans';

/**
 * Returns true if site is on a business plan, false if the site is not
 * or if the site or plan is unknown.
 *
 * @param { object } state Global state tree
 * @param { number } siteId Site ID
 * @returns { boolean } If the site is on a Business plan
 */
const isSiteOnBusinessPlan = ( state, siteId ) => {
	const currentPlan = getCurrentPlan( state, siteId );

	if ( ! currentPlan ) {
		return false;
	}

	return isBusinessPlan( currentPlan.productSlug );
};

export default isSiteOnBusinessPlan;
