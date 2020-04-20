/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import { PLAN_PREMIUM, PLAN_BUSINESS } from 'lib/plans/constants';
import { getSitePlan } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

// NOTE: selector moved here because tour is no longer active and serves as example only
// to use in a tour, move back to 'state/ui/guided-tours/contexts' (see commented out import above)
/**
 * Returns true if the selected site is on the Premium or Business plan
 *
 * @param {object} state Global state tree
 * @returns {boolean} True if selected site is on the Premium or Business plan, false otherwise.
 */

export const hasSelectedSitePremiumOrBusinessPlan = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const sitePlan = getSitePlan( state, siteId );
	if ( ! sitePlan ) {
		return false;
	}
	return includes( [ PLAN_PREMIUM, PLAN_BUSINESS ], sitePlan.product_slug );
};
