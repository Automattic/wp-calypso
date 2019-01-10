/** @format */

/**
 * External dependencies
 */
import { some } from 'lodash';

/**
 * Internal dependencies
 */
import { getCurrentUserLocale } from 'state/current-user/selectors';
import getSitesItems from 'state/selectors/get-sites-items';
import { isBusinessPlan, isEcommercePlan } from 'lib/plans';

/**
 * @param {Object} state Global state tree
 * @return {Boolean} Whether or not this customer should receive Upwork support
 */
export default function isEligibleForUpworkSupport( state ) {
	// Upwork is only available for es users currently
	if ( getCurrentUserLocale( state ) !== 'es' ) {
		return false;
	}

	const hasBusinessOrEcommercePlan = some(
		getSitesItems( state ),
		site => isBusinessPlan( site.plan ) || isEcommercePlan( site.plan )
	);

	// Upwork is not available if the customer has a Business or eCommerce plan
	return ! hasBusinessOrEcommercePlan;
}
