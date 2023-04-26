import { shouldLoadGutenframe } from 'calypso/state/selectors/should-load-gutenframe';
import { getSiteAdminUrl, getSiteSlug } from 'calypso/state/sites/selectors';

/**
 * Retrieves url for site editor.
 *
 * @param {Object} state  Global state tree
 * @param {number} siteId Site ID
 * @returns {string} Url of site editor instance for calypso or wp-admin.
 */
export const getSiteEditorUrl = ( state, siteId ) => {
	const siteAdminUrl = getSiteAdminUrl( state, siteId );

	if ( ! shouldLoadGutenframe( state, siteId ) ) {
		return `${ siteAdminUrl }site-editor.php`;
	}

	const siteSlug = getSiteSlug( state, siteId );

	return `/site-editor/${ siteSlug }`;
};

export default getSiteEditorUrl;
