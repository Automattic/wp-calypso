import {
	FEATURE_WOOP,
	WPCOM_FEATURES_ATOMIC,
	WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
	FEATURE_INSTALL_THEMES,
	WPCOM_FEATURES_PREMIUM_THEMES_LIMITED,
} from '@automattic/calypso-products';
import {
	FREE_THEME,
	PREMIUM_THEME,
	DOT_ORG_THEME,
	BUNDLED_THEME,
	MARKETPLACE_THEME,
	PERSONAL_THEME,
} from '@automattic/design-picker';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getThemeType, getThemeSoftwareSet } from 'calypso/state/themes/selectors';

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
	const type = getThemeType( state, themeId );

	if ( type === FREE_THEME ) {
		return true;
	}

	if ( type === PERSONAL_THEME ) {
		return siteHasFeature( state, siteId, WPCOM_FEATURES_PREMIUM_THEMES_LIMITED );
	}

	if ( type === PREMIUM_THEME ) {
		return siteHasFeature( state, siteId, WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED );
	}

	if ( type === DOT_ORG_THEME ) {
		return siteHasFeature( state, siteId, FEATURE_INSTALL_THEMES );
	}

	if ( type === BUNDLED_THEME ) {
		const themeSoftwareSet = getThemeSoftwareSet( state, themeId );
		const themeSoftware = themeSoftwareSet[ 0 ];

		const featureChecks = [
			WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
			WPCOM_FEATURES_ATOMIC,
			...( extraFeatureChecks[ themeSoftware ] || [] ),
		];

		return featureChecks.every( ( feature ) => siteHasFeature( state, siteId, feature ) );
	}

	if ( type === MARKETPLACE_THEME ) {
		return siteHasFeature( state, siteId, WPCOM_FEATURES_ATOMIC );
	}

	return false;
}
