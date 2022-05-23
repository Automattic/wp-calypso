import config from '@automattic/calypso-config';
import { isBusinessPlan, isEcommercePlan, isProPlan } from '@automattic/calypso-products';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import getSitesItems from 'calypso/state/selectors/get-sites-items';
import type { AppState } from 'calypso/types';

/**
 * @param state Global state tree
 * @returns Whether or not this customer should receive Upwork support
 */
export default function isEligibleForUpworkSupport( state: AppState ): boolean {
	if (
		! config< string[] >( 'upwork_support_locales' ).includes( getCurrentUserLocale( state ) )
	) {
		return false;
	}

	// If any site has an Upwork Support exemption, the user is not eligible.
	return ! Object.values( getSitesItems( state ) ).some( ( site ) => {
		const planSlug = site.plan?.product_slug ?? '';
		return isBusinessPlan( planSlug ) || isEcommercePlan( planSlug ) || isProPlan( planSlug );
	} );
}
