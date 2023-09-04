import { addQueryArgs } from '@wordpress/url';
import { getThemeType, isThemePremium } from 'calypso/state/themes/selectors';

import 'calypso/state/themes/init';

/**
 * Returns the URL for signing up for a new WordPress.com account with the given theme pre-selected.
 *
 * @param  {Object}  state   Global state tree
 * @param  {string}  themeId Theme ID
 * @param  {Object}  options The options for the theme signup url
 * @returns {?string}         Signup URL
 */
export function getThemeSignupUrl( state, themeId, options = {} ) {
	if ( ! themeId ) {
		return null;
	}

	const { category, styleVariationSlug } = options;
	const searchParams = {
		ref: 'calypshowcase',
		theme: themeId,
		theme_type: getThemeType( state, themeId ),
		style_variation: styleVariationSlug,
	};

	// If the selected theme belongs to the blog category, redirect users to the blog tailored flow
	if ( category === 'blog' ) {
		return addQueryArgs( '/setup/start-writing', searchParams );
	}

	if ( isThemePremium( state, themeId ) ) {
		searchParams.premium = true;
	}

	return addQueryArgs( '/start/with-theme', searchParams );
}
