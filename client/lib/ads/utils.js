import {
	isBusiness,
	isPremium,
	isEcommerce,
	isSecurityDaily,
	isSecurityRealTime,
	isSecurityT1,
	isSecurityT2,
	isComplete,
	isPro,
} from '@automattic/calypso-products';
import { userCan } from 'calypso/lib/site/utils';

export function hasWordAdsPlan( site ) {
	return (
		isPremium( site.plan ) ||
		isBusiness( site.plan ) ||
		isEcommerce( site.plan ) ||
		isSecurityDaily( site.plan ) ||
		isSecurityRealTime( site.plan ) ||
		isSecurityT1( site.plan ) ||
		isSecurityT2( site.plan ) ||
		isComplete( site.plan ) ||
		isPro( site.plan )
	);
}

/**
 * Returns true if the site has WordAds access
 *
 * @param  site Site object
 * @returns {boolean}      true if site has WordAds access
 */
export function canAccessWordads( site ) {
	if ( site ) {
		if ( hasWordAdsPlan( site ) && userCan( 'activate_wordads', site ) ) {
			return true;
		}

		const jetpackPremium = site.jetpack && hasWordAdsPlan( site );
		return (
			site.options &&
			( site.options.wordads || jetpackPremium ) &&
			userCan( 'manage_options', site )
		);
	}

	return false;
}
