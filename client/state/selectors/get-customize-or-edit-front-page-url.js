/**
 * Internal dependencies
 */
import { getThemeCustomizeUrl, isThemeActive } from 'calypso/state/themes/selectors';
import isSiteUsingFullSiteEditing from 'calypso/state/selectors/is-site-using-full-site-editing';
import getFrontPageEditorUrl from 'calypso/state/selectors/get-front-page-editor-url';
import shouldCustomizeHomepageWithGutenberg from 'calypso/state/selectors/should-customize-homepage-with-gutenberg';

/**
 * Returns the URL for opening customizing the given site in either the block editor with
 * Full Site Editing, or the Customizer for unsupported sites. Can be used wherever
 *
 * @see getThemeCustomizeUrl is used as a drop-in replacement.
 *
 * Ensure that your view makes use of the `QueryBlogStickers` component to function properly.
 *
 * @param  {object}   state   Global state tree
 * @param  {string}   themeId Theme ID
 * @param  {number}   siteId  Site ID to open the customizer or block editor for
 * @returns {string}           Customizer or Block Editor URL
 */
export default function getCustomizeOrEditFrontPageUrl( state, themeId, siteId ) {
	const shouldUseGutenberg =
		shouldCustomizeHomepageWithGutenberg( state, siteId ) ||
		isSiteUsingFullSiteEditing( state, siteId );
	const frontPageEditorUrl = getFrontPageEditorUrl( state, siteId );

	// If the theme is not active or getFrontPageEditorUrl has returned 'false', use the other function to preview customization with the theme.
	if ( frontPageEditorUrl && shouldUseGutenberg && isThemeActive( state, themeId, siteId ) ) {
		return frontPageEditorUrl;
	}

	return getThemeCustomizeUrl( state, themeId, siteId );
}
