/**
 * Internal dependencies
 */
import { shouldRedirectGutenberg } from 'state/selectors/should-redirect-gutenberg';
import { getSiteAdminUrl } from 'state/sites/selectors';

/**
 * Retrieves url for site editor.
 *
 * @param {object} state  Global state tree
 * @param {object} siteId Site ID
 * @returns {string} Url of site editor instance for calypso or wp-admin.
 */
export const getSiteEditorUrl = ( state, siteId ) => {
	const siteAdminUrl = getSiteAdminUrl( state, siteId );

	if ( shouldRedirectGutenberg( state, siteId ) ) {
		return `${ siteAdminUrl }admin.php?page=gutenberg-edit-site`;
	}

	// @TODO Update this to be URL for the iframe route.
	return `${ siteAdminUrl }admin.php?page=gutenberg-edit-site`;
};

export default getSiteEditorUrl;
