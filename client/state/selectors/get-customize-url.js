/**
 * Internal dependencies
 */
import { getThemeCustomizeUrl } from 'calypso/state/themes/selectors';
import isSiteUsingFullSiteEditing from 'calypso/state/selectors/is-site-using-full-site-editing';
import isSiteUsingCoreSiteEditor from 'calypso/state/selectors/is-site-using-core-site-editor';
import getFrontPageEditorUrl from 'calypso/state/selectors/get-front-page-editor-url';
/**
 * Returns the URL for clicking on "Customize". The block editor URL is returned for sites with
 * Full Site Editing or if they are using the Core Site Editor. Otherwise we return the
 * Customizer URL.
 *
 * @param  {object}   state   Global state tree
 * @param  {string}   themeId Theme ID
 * @param  {number}   siteId  Site ID to open the customizer or block editor for
 * @returns {string}           Customizer or Block Editor URL
 */
export default function getCustomizeUrl( state, themeId, siteId ) {
	return isSiteUsingFullSiteEditing( state, siteId ) || isSiteUsingCoreSiteEditor( state, siteId )
		? getFrontPageEditorUrl( state, siteId )
		: getThemeCustomizeUrl( state, themeId, siteId );
}
