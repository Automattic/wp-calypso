/**
 * Internal dependencies
 */
import { isEligibleForGutenframe } from 'calypso/state/gutenberg-iframe-eligible/is-eligible-for-gutenframe';
import { getSiteAdminUrl, getSiteSlug } from 'calypso/state/sites/selectors';

/**
 * Retrieves url for site editor.
 *
 * @param {object} state  Global state tree
 * @param {object} siteId Site ID
 * @returns {string} Url of site editor instance for calypso or wp-admin.
 */
export const getSiteEditorUrl = ( state, siteId ) => {
	const siteAdminUrl = getSiteAdminUrl( state, siteId );

	if ( ! isEligibleForGutenframe( state, siteId ) ) {
		return `${ siteAdminUrl }admin.php?page=gutenberg-edit-site`;
	}

	const siteSlug = getSiteSlug( state, siteId );

	return `/site-editor/${ siteSlug }`;
};

export default getSiteEditorUrl;
