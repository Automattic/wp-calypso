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

const getThemeTierFeatureChecks = ( state, siteId, themeId ) => {
	const themeTier = getThemeTierForTheme( state, themeId );

	switch ( themeTier.slug ) {
		case 'free': {
			return [];
		}

		case 'personal': {
			return [ WPCOM_FEATURES_PREMIUM_THEMES_LIMITED ];
		}

		case 'premium': {
			return [ WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED ];
		}

		case 'community': {
			return [ FEATURE_INSTALL_THEMES, WPCOM_FEATURES_COMMUNITY_THEMES ];
		}

		case 'sensei': {
			return [ WPCOM_FEATURES_SENSEI_THEMES, WPCOM_FEATURES_ATOMIC ];
		}

		case 'woocommerce': {
			const themeSoftwareSet = getThemeSoftwareSet( state, themeId );
			const themeSoftware = themeSoftwareSet[ 0 ];

			return [
				WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
				WPCOM_FEATURES_ATOMIC,
				...( extraFeatureChecks[ themeSoftware ] || [] ),
			];
		}

		case 'partner': {
			return [ WPCOM_FEATURES_ATOMIC ];
		}

		default: {
			return null;
		}
	}
};

/**
 * Checks whether the given theme is included in the current plan of the site.
 * @param  {Object}  state   Global state tree
 * @param  {number}  siteId  Site ID
 * @param  {string}  themeId Theme ID
 * @returns {boolean}         Whether the theme is included in the site plan.
 */
export function canUseTheme( state, siteId, themeId ) {
	const featureChecks = getThemeTierFeatureChecks( state, siteId, themeId );

	if ( featureChecks === null ) {
		return false;
	}

	return featureChecks.every( ( feature ) => siteHasFeature( state, siteId, feature ) );
}
