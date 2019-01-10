/** @format */

/**
 * External dependencies
 */
import { get, some } from 'lodash';

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

	const hasBusinessOrEcommercePlan = some( getSitesItems( state ), site => {
		const planSlug = get( site, 'plan.product_slug' );
		return isBusinessPlan( planSlug ) || isEcommercePlan( planSlug );
	} );
	// Upwork is not available if the customer has a Business or eCommerce plan
	return ! hasBusinessOrEcommercePlan;
}
