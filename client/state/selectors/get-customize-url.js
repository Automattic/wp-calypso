import getSiteEditorUrl from 'calypso/state/selectors/get-site-editor-url';
import { getThemeCustomizeUrl } from 'calypso/state/themes/selectors';
/**
 * Returns the URL for clicking on "Customize". The block editor URL is returned for sites with
 * Full Site Editing or if they are using the Core Site Editor. Otherwise we return the
 * Customizer URL.
 *
 * @param  {Object}   state   Global state tree
 * @param  {string}   themeId Theme ID
 * @param  {number}   siteId  Site ID to open the customizer or block editor for
 * @returns {string}           Customizer or Block Editor URL
 */
export default function getCustomizeUrl( state, themeId, siteId, isFSEActive = false ) {
	// Core FSE
	if ( isFSEActive ) {
		return getSiteEditorUrl( state, siteId );
	}

	return getThemeCustomizeUrl( state, themeId, siteId );
}
