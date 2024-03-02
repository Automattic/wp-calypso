import { FREE_THEME, BUNDLED_THEME, MARKETPLACE_THEME } from '@automattic/design-picker';
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

	let themeTypeParam = themeType;
	// Map theme tier values to the values expected by the signup flow.
	const themeTier = options.themeTier;
	// If there is no themeTier then there's nothing to map.
	if ( themeTier?.slug ) {
		switch ( themeTier.slug ) {
			case 'woocommerce':
			case 'sensei':
				themeTypeParam = BUNDLED_THEME;
				break;
			case 'partner':
				themeTypeParam = MARKETPLACE_THEME;
				break;
			default:
				themeTypeParam = themeTier.slug;
				break;
		}
	}

	const searchParams = {
		ref: 'calypshowcase',
		theme: themeId,
		theme_type: themeTypeParam,
		style_variation: styleVariationSlug,
		intervalType: themeTypeParam === MARKETPLACE_THEME ? 'monthly' : 'yearly',
	};

	// If the selected free theme belongs to the blog category, redirect users to the blog tailored flow
	if ( themeTypeParam === FREE_THEME && tabFilter === 'blog' ) {
		return addQueryArgs( `/setup/${ DESIGN_FIRST_FLOW }`, searchParams );
	}

	// Used to prefix the theme slug when creating `themeSlugWithRepo` which is then used in onboarding.
	// Does it just mean "is paid", is it actually the dir prefix, or both?
	if ( isThemePremium( state, themeId ) ) {
		searchParams.premium = true;
	}

	return addQueryArgs( '/start/with-theme', searchParams );
}
