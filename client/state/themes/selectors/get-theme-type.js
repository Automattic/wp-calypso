import {
	FREE_THEME,
	PERSONAL_THEME,
	PREMIUM_THEME,
	DOT_ORG_THEME,
	BUNDLED_THEME,
	MARKETPLACE_THEME,
} from '@automattic/design-picker';
import { doesThemeBundleSoftwareSet } from 'calypso/state/themes/selectors/does-theme-bundle-software-set';
import { isExternallyManagedTheme } from 'calypso/state/themes/selectors/is-externally-managed-theme';
import { isThemePersonal } from 'calypso/state/themes/selectors/is-theme-personal';
import { isThemePremium } from 'calypso/state/themes/selectors/is-theme-premium';
import { isWpcomTheme } from 'calypso/state/themes/selectors/is-wpcom-theme';
import { isWporgTheme } from 'calypso/state/themes/selectors/is-wporg-theme';

import 'calypso/state/themes/init';

/**
 * Get the theme type.
 * @param  {Object}  state   Global state tree
 * @param  {string}  themeId Theme ID
 * @returns {string}         theme type
 */
export function getThemeType( state, themeId ) {
	if ( isExternallyManagedTheme( state, themeId ) ) {
		return MARKETPLACE_THEME;
	}

	if ( doesThemeBundleSoftwareSet( state, themeId ) ) {
		return BUNDLED_THEME;
	}

	if ( isThemePremium( state, themeId ) ) {
		return PREMIUM_THEME;
	}

	if ( isThemePersonal( state, themeId ) ) {
		return PERSONAL_THEME;
	}

	if ( isWpcomTheme( state, themeId ) ) {
		return FREE_THEME;
	}

	if ( isWporgTheme( state, themeId ) ) {
		return DOT_ORG_THEME;
	}

	// Unhandled type, fallback to free.
	return FREE_THEME;
}
