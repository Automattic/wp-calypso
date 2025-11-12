import {
	FEATURE_WOOP,
	WPCOM_FEATURES_ATOMIC,
	WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
	FEATURE_INSTALL_THEMES,
	WPCOM_FEATURES_PREMIUM_THEMES_LIMITED,
	WPCOM_FEATURES_COMMUNITY_THEMES,
	WPCOM_FEATURES_SENSEI_THEMES,
} from '@automattic/calypso-products';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getThemeSoftwareSet, getThemeTierForTheme } from 'calypso/state/themes/selectors';

import 'calypso/state/themes/init';

const extraFeatureChecks = {
	'woo-on-plans': [ FEATURE_WOOP ],
};

/**
 * Checks whether the given theme is included in the current plan of the site.
 * @param  {Object}  state   Global state tree
 * @param  {number}  siteId  Site ID
 * @param  {string}  themeId Theme ID
 * @returns {boolean}         Whether the theme is included in the site plan.
 */
export function canUseTheme( state, siteId, themeId ) {
	const themeTier = getThemeTierForTheme( state, themeId );

	if ( themeTier.slug === 'free' ) {
		return true;
	}

	if ( themeTier.slug === 'personal' ) {
		return siteHasFeature( state, siteId, WPCOM_FEATURES_PREMIUM_THEMES_LIMITED );
	}

	if ( themeTier.slug === 'premium' ) {
		return siteHasFeature( state, siteId, WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED );
	}

	// is this exactly the same as type DOT_ORG?
	if ( themeTier.slug === 'community' ) {
		return (
			siteHasFeature( state, siteId, FEATURE_INSTALL_THEMES ) &&
			siteHasFeature( state, siteId, WPCOM_FEATURES_COMMUNITY_THEMES )
		);
	}

	if ( themeTier.slug === 'sensei' ) {
		const featureChecks = [ WPCOM_FEATURES_SENSEI_THEMES, WPCOM_FEATURES_ATOMIC ];
		return featureChecks.every( ( feature ) => siteHasFeature( state, siteId, feature ) );
	}

	if ( themeTier.slug === 'woocommerce' ) {
		const themeSoftwareSet = getThemeSoftwareSet( state, themeId );
		const themeSoftware = themeSoftwareSet[ 0 ];

		const featureChecks = [
			WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
			WPCOM_FEATURES_ATOMIC,
			...( extraFeatureChecks[ themeSoftware ] || [] ),
		];

		return featureChecks.every( ( feature ) => siteHasFeature( state, siteId, feature ) );
	}

	if ( themeTier.slug === 'partner' ) {
		return siteHasFeature( state, siteId, WPCOM_FEATURES_ATOMIC );
	}

	return false;
}
