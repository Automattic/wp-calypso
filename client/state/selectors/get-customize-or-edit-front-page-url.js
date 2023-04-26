import getFrontPageEditorUrl from 'calypso/state/selectors/get-front-page-editor-url';
import getSiteEditorUrl from 'calypso/state/selectors/get-site-editor-url';
import shouldCustomizeHomepageWithGutenberg from 'calypso/state/selectors/should-customize-homepage-with-gutenberg';
import { getThemeCustomizeUrl, isThemeActive } from 'calypso/state/themes/selectors';

/**
 * Returns the URL for opening customizing the given site in either the block editor with
 * Full Site Editing, or the Customizer for unsupported sites. Can be used wherever
 *
 * @see getThemeCustomizeUrl is used as a drop-in replacement.
 *
 * Ensure that your view makes use of the `QueryBlogStickers` component to function properly.
 * @param  {Object}   state       Global state tree
 * @param  {string}   themeId     Theme ID
 * @param  {number}   siteId      Site ID to open the customizer or block editor for
 * @param  {boolean}  isFSEActive Whether full-site editing is enabled for the site
 * @returns {string}              Customizer or Block Editor URL
 */
export default function getCustomizeOrEditFrontPageUrl( state, themeId, siteId, isFSEActive ) {
	if ( isFSEActive ) {
		return getSiteEditorUrl( state, siteId );
	}

	const shouldUseGutenberg = shouldCustomizeHomepageWithGutenberg( state, siteId );
	const frontPageEditorUrl = getFrontPageEditorUrl( state, siteId );

	// If the theme is not active or getFrontPageEditorUrl has returned 'false', use the other function to preview customization with the theme.
	if ( frontPageEditorUrl && shouldUseGutenberg && isThemeActive( state, themeId, siteId ) ) {
		return frontPageEditorUrl;
	}

	return getThemeCustomizeUrl( state, themeId, siteId );
}
