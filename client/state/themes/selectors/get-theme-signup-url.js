import { doesThemeBundleSoftwareSet } from 'calypso/state/themes/selectors/does-theme-bundle-software-set';
import { isThemePremium } from 'calypso/state/themes/selectors/is-theme-premium';

import 'calypso/state/themes/init';

/**
 * Returns the URL for signing up for a new WordPress.com account with the given theme pre-selected.
 *
 * @param  {object}  state   Global state tree
 * @param  {string}  themeId Theme ID
 * @returns {?string}         Signup URL
 */
export function getThemeSignupUrl( state, themeId ) {
	if ( ! themeId ) {
		return null;
	}

	const flow = ! doesThemeBundleSoftwareSet( state, themeId )
		? 'with-theme'
		: 'with-business-theme';

	let url = `/start/${ flow }?ref=calypshowcase&theme=${ themeId }`;

	if ( isThemePremium( state, themeId ) ) {
		url += '&premium=true';
	}

	return url;
}
