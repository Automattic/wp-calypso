import {
	// isFreePlan,
	// isPersonalPlan,
	// isPremiumPlan,
	isBusinessPlan,
	isEcommercePlan,
} from '@automattic/calypso-products';
import { getPluginOnSite } from 'calypso/state/plugins/installed/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';

/**
 * Returns true if the current user is eligible to install WooCommerce on Plans.
 *
 * @param {object} state Global state tree
 * @param {number} siteId Site ID
 * @returns {?boolean} True if the user can participate in the free to paid upsell
 */
export default function isEligibleForWooOnPlans( state, siteId ) {
	const plan = getCurrentPlan( state, siteId );

	if ( ! plan ) {
		return false;
	}

	if ( isAtomicSite( state, siteId ) && getPluginOnSite( state, siteId, 'woocommerce' )?.active ) {
		return false;
	}

	return (
		canCurrentUser( state, siteId, 'manage_options' ) &&
		// ( isFreePlan( plan.productSlug ) ||
		// 	isPersonalPlan( plan.productSlug ) ||
		// 	isPremiumPlan( plan.productSlug ) ||
		// 	isBusinessPlan( plan.productSlug ) ||
		// 	isEcommercePlan( plan.productSlug ) )
		( isBusinessPlan( plan.productSlug ) || isEcommercePlan( plan.productSlug ) )
	);
}
