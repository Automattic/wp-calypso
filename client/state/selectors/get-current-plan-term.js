/**
 * Internal dependencies
 */
import { getPlan } from 'lib/plans';
import { getSitePlan } from 'state/sites/selectors';

/**
 * Returns term of the active plan for given siteId, e.g. value
 * of constant TERM_MONTHLY defined in lib/plans/constants
 *
 * @param {Object} state Current state
 * @param {Number} siteId Site ID
 * @return {string} Human-readable interval type
 */
export default function getTermFromCurrentPlan( state, siteId ) {
	const currentPlanProduct = getSitePlan( state, siteId );
	if ( ! currentPlanProduct ) {
		return null;
	}

	const currentPlanObject = getPlan( currentPlanProduct.product_slug );
	if ( ! currentPlanObject ) {
		return null;
	}
	return currentPlanObject.term;
}
