import { isBusinessPlan, isEcommercePlan } from '@automattic/calypso-products';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSite } from 'calypso/state/sites/selectors';

/**
 * Returns true if the current user is eligible to install WooCommerce on Plans.
 *
 * @param {object} state Global state tree
 * @param {number} siteId Site ID
 * @returns {?boolean} True if the user can participate in the free to paid upsell
 */
export default function canInstallWooOnPlans( state, siteId ) {
	const productSlug = getSite( state, siteId )?.plan?.product_slug;

	if ( ! productSlug ) {
		return false;
	}

	return (
		canCurrentUser( state, siteId, 'manage_options' ) &&
		( isBusinessPlan( productSlug ) || isEcommercePlan( productSlug ) )
	);
}
