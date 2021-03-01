/**
 * Internal dependencies
 */
import { getCustomizerUrl, isJetpackSite } from 'calypso/state/sites/selectors';
import { getTheme } from 'calypso/state/themes/selectors/get-theme';
import { isThemeActive } from 'calypso/state/themes/selectors/is-theme-active';

import 'calypso/state/themes/init';

/**
 * Returns the URL for opening the customizer with the given theme on the given site.
 *
 * @param  {object}   state   Global state tree
 * @param  {string}   themeId Theme ID
 * @param  {?number}  siteId  Site ID to open the customizer for
 * @returns {?string}          Customizer URL
 */
export function getThemeCustomizeUrl( state, themeId, siteId ) {
	const customizerUrl = getCustomizerUrl( state, siteId );

	if ( ! ( siteId && themeId ) || isThemeActive( state, themeId, siteId ) ) {
		return customizerUrl;
	}

	const separator = typeof customizerUrl === 'string' && customizerUrl.includes( '?' ) ? '&' : '?';
	let identifier;

	if ( isJetpackSite( state, siteId ) ) {
		identifier = themeId;
	} else {
		const theme = getTheme( state, 'wpcom', themeId );
		if ( ! theme ) {
			return customizerUrl;
		}
		identifier = theme.stylesheet;
	}

	return customizerUrl + separator + 'theme=' + identifier;
}
