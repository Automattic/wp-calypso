import { addQueryArgs } from 'calypso/lib/route';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';

/**
 * Retrieves url for site editor.
 *
 * @param {Object} state  Global state tree
 * @param {?number} siteId Site ID
 * @returns {string} Url of site editor instance for calypso or wp-admin.
 */
export const getSiteEditorUrl = ( state, siteId ) => {
	const siteAdminUrl = getSiteAdminUrl( state, siteId );
	const queryArgs = {};
	// Only add the origin if it's not wordpress.com.
	if ( typeof window !== 'undefined' && window.location.origin !== 'https://wordpress.com' ) {
		queryArgs.calypso_origin = window.location.origin;
	}
	return addQueryArgs( queryArgs, `${ siteAdminUrl }site-editor.php` );
};

export default getSiteEditorUrl;
