import config from '@automattic/calypso-config';
import { isBusinessPlan, isEcommercePlan } from '@automattic/calypso-products';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import getSitesItems from 'calypso/state/selectors/get-sites-items';

/**
 * @param state Global state tree
 * @returns Whether or not this customer should receive Upwork support
 */
export default function isEligibleForUpworkSupport( state ): boolean {
	if ( ! config( 'upwork_support_locales' ).includes( getCurrentUserLocale( state ) ) ) {
		return false;
	}

	const hasBusinessOrEcommercePlan = Object.values( getSitesItems( state ) ).some( ( site ) => {
		const planSlug = site.plan?.product_slug;
		return isBusinessPlan( planSlug ) || isEcommercePlan( planSlug );
	} );

	// Upwork is not available if the customer has a Business or eCommerce plan
	return ! hasBusinessOrEcommercePlan;
}
