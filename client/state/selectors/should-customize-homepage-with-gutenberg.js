/**
 * Internal dependencies
 */
import getSiteFrontPageType from 'state/sites/selectors/get-site-front-page-type';
import { getActiveTheme, isThemeGutenbergFirst } from '../themes/selectors';

/**
 * Returns whether the homepage should be customized with Gutenberg.
 *
 * Used to open the block editor instead of the customizer for some themes.
 *
 * @param {Object} state  The global state object.
 * @param {String} siteId The ID of the selected site.
 * @return {Boolean} True if Gutenberg should be opened.
 */
export default function shouldCustomizeHomepageWithGutenberg( state, siteId ) {
	const theme = getActiveTheme( state, siteId );
	const isGutenbergTheme = isThemeGutenbergFirst( state, theme );
	const isHomepageAPage = 'page' === getSiteFrontPageType( state, siteId );
	return isGutenbergTheme && isHomepageAPage;
}
