import { isThemePremium } from 'calypso/state/themes/selectors/is-theme-premium';

import 'calypso/state/themes/init';

/**
 * Returns the URL for signing up for a new WordPress.com account with the given theme pre-selected.
 *
 * @param  {object}  state      Global state tree
 * @param  {string}  themeId    Theme ID
 * @param  {string}  themeStyle Theme style
 * @returns {?string}         Signup URL
 */
export function getThemeSignupUrl( state, themeId, themeStyle ) {
	if ( ! themeId ) {
		return null;
	}

	let url = '/start/with-theme?ref=calypshowcase&theme=' + themeId;
	if ( themeStyle ) {
		url += `&style=${ themeStyle.slug }`;
	}

	if ( isThemePremium( state, themeId ) ) {
		url += '&premium=true';
	}

	return url;
}
