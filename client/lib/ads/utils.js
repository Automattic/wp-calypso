/**
 * Internal dependencies
 */
import { userCan } from 'lib/site/utils';
import { isBusiness, isPremium } from 'lib/products-values';

/**
 * Returns true if the site has WordAds access
 * @param  {Site} site Site object
 * @return {boolean}      true if site has WordAds access
 */
export function canAccessWordads( site ) {
	if ( site ) {
		if ( isWordadsInstantActivationEligible( site ) ) {
			return true;
		}

		const jetpackPremium = site.jetpack && ( isPremium( site.plan ) || isBusiness( site.plan ) );
		return site.options &&
			( site.options.wordads || jetpackPremium ) &&
			userCan( 'manage_options', site );
	}

	return false;
}

export function isWordadsInstantActivationEligible( site ) {
	if (
		( isBusiness( site.plan ) || isPremium( site.plan ) ) &&
		userCan( 'activate_wordads', site ) &&
		! site.jetpack
	) {
		return true;
	}

	return false;
}
