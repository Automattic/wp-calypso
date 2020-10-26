/**
 * Internal dependencies
 */
import { getPlan } from 'calypso/lib/plans';
import { getSitePlan } from 'calypso/state/sites/selectors';

/**
 * Returns term of the active plan for given siteId, e.g. value
 * of constant TERM_MONTHLY defined in lib/plans/constants
 *
 * @param {object} state Current state
 * @param {number} siteId Site ID
 * @returns {string} Human-readable interval type
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
