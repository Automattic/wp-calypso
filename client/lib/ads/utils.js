/**
 * Internal dependencies
 */
import config from 'config';
import { userCan } from 'lib/site/utils';
import { isBusiness, isPremium } from 'lib/products-values';
import { abtest } from 'lib/abtest';

/**
 * Returns true if the site has WordAds access
 * @param  {Site} site Site object
 * @return {boolean}      true if site has WordAds access
 */
export function canAccessWordads( site ) {
	if ( site && config.isEnabled( 'manage/ads' ) ) {
		if ( isWordadsInstantActivationEligible( site ) ) {
			return true;
		}

		return site.options &&
			site.options.wordads &&
			userCan( 'manage_options', site ) &&
			( ! site.jetpack || config.isEnabled( 'manage/ads/jetpack' ) );
	}

	return false;
}

export function isWordadsInstantActivationEligible( site ) {
	if (
		config.isEnabled( 'manage/ads/wordads-instant' ) &&
		( isBusiness( site.plan ) || isPremium( site.plan ) ) &&
		abtest( 'wordadsInstantActivation' ) === 'enabled' &&
		userCan( 'activate_wordads', site ) &&
		! site.jetpack
	) {
		return true;
	}

	return false;
}
