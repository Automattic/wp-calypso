import {
	FREE_THEME,
	PREMIUM_THEME,
	DOT_ORG_THEME,
	WOOCOMMERCE_THEME,
	MARKETPLACE_THEME,
} from '@automattic/design-picker';
import { doesThemeBundleSoftwareSet } from 'calypso/state/themes/selectors/does-theme-bundle-software-set';
import { isExternallyManagedTheme } from 'calypso/state/themes/selectors/is-externally-managed-theme';
import { isThemePremium } from 'calypso/state/themes/selectors/is-theme-premium';
import { isThemeRetired } from 'calypso/state/themes/selectors/is-theme-retired';
import { isWpcomTheme } from 'calypso/state/themes/selectors/is-wpcom-theme';
import { isWporgTheme } from 'calypso/state/themes/selectors/is-wporg-theme';

import 'calypso/state/themes/init';

/**
 * Get the theme type.
 *
 * @param  {Object}  state   Global state tree
 * @param  {string}  themeId Theme ID
 * @returns {string}         theme type
 */
export function getThemeType( state, themeId ) {
	// When the theme exists both in wpcom and dotorg,
	// resolve the theme type as the latter if the theme in wpcom is set as retired.
	// See: https://github.com/Automattic/wp-calypso/issues/78091
	if ( isThemeRetired( state, themeId ) && isWporgTheme( state, themeId ) ) {
		return DOT_ORG_THEME;
	}

	if ( isExternallyManagedTheme( state, themeId ) ) {
		return MARKETPLACE_THEME;
	}

	if ( doesThemeBundleSoftwareSet( state, themeId ) ) {
		return WOOCOMMERCE_THEME;
	}

	if ( isThemePremium( state, themeId ) ) {
		return PREMIUM_THEME;
	}

	if ( isWpcomTheme( state, themeId ) && ! isThemePremium( state, themeId ) ) {
		return FREE_THEME;
	}

	if ( isWporgTheme( state, themeId ) ) {
		return DOT_ORG_THEME;
	}

	// Unhandled type, fallback to free.
	return FREE_THEME;
}
