/**
 * Internal dependencies
 */

import { userCan } from 'lib/site/utils';
import { isBusiness, isPremium, isEcommerce } from 'lib/products-values';

/**
 * Returns true if the site has WordAds access
 *
 * @param  site Site object
 * @returns {boolean}      true if site has WordAds access
 */
export function canAccessWordads( site ) {
	if ( site ) {
		if ( isWordadsInstantActivationEligible( site ) ) {
			return true;
		}

		const jetpackPremium =
			site.jetpack &&
			( isPremium( site.plan ) || isBusiness( site.plan ) || isEcommerce( site.plan ) );
		return (
			site.options &&
			( site.options.wordads || jetpackPremium ) &&
			userCan( 'manage_options', site )
		);
	}

	return false;
}

export function canAccessAds( site ) {
	return (
		( canAccessWordads( site ) || canUpgradeToUseWordAds( site ) ) &&
		userCan( 'manage_options', site )
	);
}

export function hasWordadsPlan( site ) {
	return isPremium( site.plan ) || isBusiness( site.plan ) || isEcommerce( site.plan );
}

export function isWordadsInstantActivationEligible( site ) {
	return hasWordadsPlan( site ) && userCan( 'activate_wordads', site );
}

export function isWordadsInstantActivationEligibleButNotOwner( site ) {
	return hasWordadsPlan( site ) && ! userCan( 'activate_wordads', site );
}

export function canUpgradeToUseWordAds( site ) {
	if (
		site &&
		! site.options.wordads &&
		! isBusiness( site.plan ) &&
		! isPremium( site.plan ) &&
		! isEcommerce( site.plan )
	) {
		return true;
	}

	return false;
}
