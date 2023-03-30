import { addQueryArgs } from 'calypso/lib/route';
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
	if ( ! shouldLoadGutenframe( state, siteId ) ) {
		const siteAdminUrl = getSiteAdminUrl( state, siteId );
		let siteEditorUrl = `${ siteAdminUrl }site-editor.php`;
		if ( window.location.origin !== 'https://wordpress.com' ) {
			// Helps to maintain origin across different environments
			siteEditorUrl = addQueryArgs( { origin: window.location.origin }, siteEditorUrl );
		}
		return siteEditorUrl;
	}

	const siteSlug = getSiteSlug( state, siteId );

	return `/site-editor/${ siteSlug }`;
};

export default getSiteEditorUrl;
