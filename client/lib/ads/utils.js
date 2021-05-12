/**
 * Internal dependencies
 */
import { userCan } from 'calypso/lib/site/utils';
import {
	isBusiness,
	isPremium,
	isEcommerce,
	isSecurityDaily,
	isSecurityRealTime,
	isComplete,
} from '@automattic/calypso-products';

export function hasWordAdsPlan( site ) {
	return (
		isPremium( site.plan ) ||
		isBusiness( site.plan ) ||
		isEcommerce( site.plan ) ||
		isSecurityDaily( site.plan ) ||
		isSecurityRealTime( site.plan ) ||
		isComplete( site.plan )
	);
}

/**
 * Returns true if the site is approved for WordAds.
 *
 * @param site Site object
 * @returns {boolean} true if site is approved for WordAds.
 */
export function isWordAdsApproved( site ) {
	return !! site.options.wordads;
}

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

		const jetpackPremium = site.jetpack && hasWordAdsPlan( site );
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

export function isWordadsInstantActivationEligible( site ) {
	return hasWordAdsPlan( site ) && userCan( 'activate_wordads', site );
}

export function isWordadsInstantActivationEligibleButNotOwner( site ) {
	return hasWordAdsPlan( site ) && ! userCan( 'activate_wordads', site );
}

export function canUpgradeToUseWordAds( site ) {
	if ( site && ! site.options.wordads && ! hasWordAdsPlan( site ) ) {
		return true;
	}

	return false;
}
