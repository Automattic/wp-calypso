/**
 * External dependencies
 */
import { intersection } from 'lodash';

/**
 * Internal dependencies
 */
import { getTheme } from 'calypso/state/themes/selectors/get-theme';
import { getThemeTaxonomySlugs } from 'calypso/state/themes/utils';

import 'calypso/state/themes/init';

/**
 * Checks if a theme should be customized primarily with Gutenberg.
 *
 * Examples include Template First Themes, which can be determined by the feature
 * global-styles or auto-loading-homepage.
 *
 * @param {object} state   Global state tree
 * @param {string} themeId An identifier for the theme - like
 *                         `independent-publisher-2` or `maywood`.
 * @returns {boolean} True if the theme should be edited with gutenberg.
 */
export function isThemeGutenbergFirst( state, themeId ) {
	const theme = getTheme( state, 'wpcom', themeId );
	const themeFeatures = getThemeTaxonomySlugs( theme, 'theme_feature' );
	const neededFeatures = [ 'global-styles', 'auto-loading-homepage' ];
	// The theme should have a positive number of matching features to qualify.
	return !! intersection( themeFeatures, neededFeatures ).length;
}
