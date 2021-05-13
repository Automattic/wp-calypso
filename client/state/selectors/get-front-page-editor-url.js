/**
 * Internal dependencies
 */
import getEditorUrl from 'calypso/state/selectors/get-editor-url';
import getSiteFrontPage from 'calypso/state/sites/selectors/get-site-front-page';

/**
 * Gets the editor URL for the current site's home page
 *
 * @param {object} state  Global state tree
 * @param {object} siteId Site ID
 * @returns {(boolean|string)} false if there is no homepage set, the editor URL if there is one
 */
export default function getFrontPageEditorUrl( state, siteId ) {
	const frontPageId = getSiteFrontPage( state, siteId );
	// this will be zero if no homepage is set
	if ( 0 === frontPageId ) {
		return false;
	}
	return getEditorUrl( state, siteId, frontPageId, 'page' );
}
