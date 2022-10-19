import { isEnabled } from '@automattic/calypso-config';
import { getTheme } from 'calypso/state/themes/selectors/get-theme';

import 'calypso/state/themes/init';

/**
 * Returns true if the theme contains a software bundle (like woo-on-plans).
 *
 * @param {object} state Global state tree
 * @param {string} themeId Theme ID
 * @returns {boolean} True if the theme contains a software bundle.
 */
export function doesThemeBundleSoftwareSet( state, themeId ) {
	const theme = getTheme( state, 'wpcom', themeId );
	const theme_software_set = theme?.taxonomies?.theme_software_set;
	return (
		isEnabled( 'themes/plugin-bundling' ) && theme_software_set && theme_software_set.length > 0
	);
}
