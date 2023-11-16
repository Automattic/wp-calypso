import {
	FEATURE_WOOP,
	WPCOM_FEATURES_ATOMIC,
	WPCOM_FEATURES_PREMIUM_THEMES,
	FEATURE_INSTALL_THEMES,
} from '@automattic/calypso-products';
import {
	FREE_THEME,
	PREMIUM_THEME,
	DOT_ORG_THEME,
	WOOCOMMERCE_THEME,
	MARKETPLACE_THEME,
} from '@automattic/design-picker';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getThemeType } from 'calypso/state/themes/selectors';

import 'calypso/state/themes/init';

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

	if ( type === PREMIUM_THEME ) {
		return siteHasFeature( state, siteId, WPCOM_FEATURES_PREMIUM_THEMES );
	}

	if ( type === DOT_ORG_THEME ) {
		return siteHasFeature( state, siteId, FEATURE_INSTALL_THEMES );
	}

	if ( type === WOOCOMMERCE_THEME ) {
		return (
			siteHasFeature( state, siteId, WPCOM_FEATURES_PREMIUM_THEMES ) &&
			siteHasFeature( state, siteId, FEATURE_WOOP ) &&
			siteHasFeature( state, siteId, WPCOM_FEATURES_ATOMIC )
		);
	}

	if ( type === MARKETPLACE_THEME ) {
		return (
			siteHasFeature( state, siteId, FEATURE_WOOP ) &&
			siteHasFeature( state, siteId, WPCOM_FEATURES_ATOMIC )
		);
	}

	return false;
}
