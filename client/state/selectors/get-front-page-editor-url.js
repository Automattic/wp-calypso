import getEditorUrl from 'calypso/state/selectors/get-editor-url';
import getSiteEditorUrl from 'calypso/state/selectors/get-site-editor-url';
import isSiteUsingCoreSiteEditor from 'calypso/state/selectors/is-site-using-core-site-editor.js';
import getSiteFrontPage from 'calypso/state/sites/selectors/get-site-front-page';

/**
 * Gets the editor URL for the current site's home page
 *
 * @param {Object} state  Global state tree
 * @param {Object} siteId Site ID
 * @returns {(boolean|string)} false if there is no homepage set, the editor URL if there is one
 */
export default function getFrontPageEditorUrl( state, siteId ) {
	const frontPageId = getSiteFrontPage( state, siteId );
	// this will be zero if no homepage is set
	if ( 0 === frontPageId ) {
		return false;
	}

	if ( isSiteUsingCoreSiteEditor( state, siteId ) ) {
		return getSiteEditorUrl( state, siteId );
	}

	return getEditorUrl( state, siteId, frontPageId, 'page' );
}
