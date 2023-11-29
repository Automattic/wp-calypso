import { FREE_THEME, MARKETPLACE_THEME } from '@automattic/design-picker';
import { DESIGN_FIRST_FLOW } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { getThemeType, isThemePremium } from 'calypso/state/themes/selectors';

import 'calypso/state/themes/init';

/**
 * Returns the URL for signing up for a new WordPress.com account with the given theme pre-selected.
 * @param  {Object}  state   Global state tree
 * @param  {string}  themeId Theme ID
 * @param  {Object}  options The options for the theme signup url
 * @returns {?string}         Signup URL
 */
export function getThemeSignupUrl( state, themeId, options = {} ) {
	if ( ! themeId ) {
		return null;
	}

	const { tabFilter, styleVariationSlug } = options;
	const themeType = getThemeType( state, themeId );
	const searchParams = {
		ref: 'calypshowcase',
		theme: themeId,
		theme_type: themeType,
		style_variation: styleVariationSlug,
		intervalType: themeType === MARKETPLACE_THEME ? 'monthly' : 'yearly',
	};

	// If the selected free theme belongs to the blog category, redirect users to the blog tailored flow
	if ( themeType === FREE_THEME && tabFilter === 'blog' ) {
		return addQueryArgs( `/setup/${ DESIGN_FIRST_FLOW }`, searchParams );
	}

	if ( isThemePremium( state, themeId ) ) {
		searchParams.premium = true;
	}

	return addQueryArgs( '/start/with-theme', searchParams );
}
