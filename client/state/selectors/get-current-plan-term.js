import { getPlan } from '@automattic/calypso-products';
import { getSitePlan } from 'calypso/state/sites/selectors';

/**
 * Returns term of the active plan for given siteId, e.g. value
 * of constant TERM_MONTHLY defined in @automattic/calypso-products
 *
 * @param {Object} state Current state
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
