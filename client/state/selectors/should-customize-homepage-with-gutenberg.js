/** @format */

/**
 * Internal dependencies
 */
import { getSiteFrontPageType } from 'state/selectors/get-site-front-page-type';
import { getActiveTheme, isThemeGutenbergFirst } from 'state/themes/selectors';

/**
 * Returns whether the homepage should be customized with Gutenberg.
 *
 * Used to open the block editor instead of the customizer for some themes.
 *
 * @param {Object} state  The global state object.
 * @param {String} siteId The ID of the selected site.
 * @return {Boolean} True if Gutenberg should be opened.
 */
export const shouldCustomizeHomepageWithGutenberg = ( state, siteId ) => {
	const theme = getActiveTheme( state, siteId );
	const isGutenbergTheme = isThemeGutenbergFirst( theme );
	const isHomepageAPage = 'page' === getSiteFrontPageType( state, siteId );
	return isGutenbergTheme && isHomepageAPage;
};

export default shouldCustomizeHomepageWithGutenberg;
