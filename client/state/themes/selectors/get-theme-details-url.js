import { addQueryArgs } from '@wordpress/url';
import { getSiteSlug } from 'calypso/state/sites/selectors';

import 'calypso/state/themes/init';

/**
 * Returns the URL for a given theme's details sheet.
 * @param  {Object}  state   Global state tree
 * @param  {string}  themeId Theme ID
 * @param  {?number} siteId  Site ID to optionally use as context
 * @param  {Object}  options The options for the theme details url
 * @returns {?string}         Theme details sheet URL
 */
export function getThemeDetailsUrl( state, themeId, siteId, options = {} ) {
	if ( ! themeId ) {
		return null;
	}

	const sitePart = siteId ? `/${ getSiteSlug( state, siteId ) }` : '';
	const { tabFilter, styleVariationSlug } = options;
	const searchParams = {};
	if ( tabFilter ) {
		searchParams.tab_filter = tabFilter;
	}

	if ( styleVariationSlug ) {
		searchParams.style_variation = styleVariationSlug;
	}

	return addQueryArgs( `/theme/${ themeId }${ sitePart }`, searchParams );
}
