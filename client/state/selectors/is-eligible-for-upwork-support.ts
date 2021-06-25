/**
 * Internal dependencies
 */
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import getSitesItems from 'calypso/state/selectors/get-sites-items';
import { isBusinessPlan, isEcommercePlan } from '@automattic/calypso-products';

export const UPWORK_LOCALES = [
	'de',
	'de-at',
	'de-li',
	'de-lu',
	'de-ch',
	'es',
	'es-cl',
	'es-mx',
	'fr',
	'fr-ca',
	'fr-be',
	'fr-ch',
	'it',
	'it-ch',
	'ja',
	'nl',
	'nl-be',
	'nl-nl',
	'pt',
	'pt-pt',
	'pt-br',
	'sv',
	'sv-fi',
	'sv-se',
];

/**
 * @param state Global state tree
 * @returns Whether or not this customer should receive Upwork support
 */
export default function isEligibleForUpworkSupport( state ): boolean {
	if ( ! UPWORK_LOCALES.includes( getCurrentUserLocale( state ) ) ) {
		return false;
	}

	const hasBusinessOrEcommercePlan = Object.values( getSitesItems( state ) ).some( ( site ) => {
		const planSlug = site.plan?.product_slug;
		return isBusinessPlan( planSlug ) || isEcommercePlan( planSlug );
	} );

	// Upwork is not available if the customer has a Business or eCommerce plan
	return ! hasBusinessOrEcommercePlan;
}
