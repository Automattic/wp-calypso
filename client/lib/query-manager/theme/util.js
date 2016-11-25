/**
 * External dependencies
 */
import { get, startsWith } from 'lodash';

/**
 * Whether a given theme object is premium.
 *
 * @param  {Object} theme Theme object
 * @return {Boolean}      True if the theme is premium
 */
export function isPremium( theme ) {
	const themeStylesheet = get( theme, 'stylesheet', false );
	return themeStylesheet && startsWith( themeStylesheet, 'premium/' );
}
