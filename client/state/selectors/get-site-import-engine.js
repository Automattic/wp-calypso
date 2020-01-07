/**
 * External dependencies
 */

import { get } from 'lodash';
/**
 * Returns The name of the import engine used for importing the site, null if no import has occurred.
 *
 * @param  {object}   state  Global state tree
 * @param  {number}   siteId Site ID
 * @returns {?string}       The import engine used for importing the site
 */
export default function getSiteImportEngine( state, siteId ) {
	return get( state, [ 'sites', 'items', siteId, 'options', 'import_engine' ], null );
}
