import getSiteFrontPageType from 'calypso/state/sites/selectors/get-site-front-page-type';
import { AppState } from 'calypso/types';
import { getActiveTheme, isThemeGutenbergFirst } from '../themes/selectors';

/**
 * Returns whether the homepage should be customized with Gutenberg.
 *
 * Used to open the block editor instead of the customizer for some themes.
 * @param {Object} state  The global state object.
 * @param {number} siteId The ID of the selected site.
 * @returns {boolean} True if Gutenberg should be opened.
 */
export default function shouldCustomizeHomepageWithGutenberg(
	state: AppState,
	siteId: number
): boolean {
	const theme = getActiveTheme( state, siteId );
	const isGutenbergTheme = theme ? isThemeGutenbergFirst( state, theme ) : false;
	const isHomepageAPage = 'page' === getSiteFrontPageType( state, siteId );
	return isGutenbergTheme && isHomepageAPage;
}
