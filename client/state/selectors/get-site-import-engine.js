/**
 * External dependencies
 */

import { get } from 'lodash';
/**
 * Returns The name of the import engine used for importing the site, null if no import has occurred.
 *
 * @param  {Object}   state  Global state tree
 * @param  {Number}   siteId Site ID
 * @return {?String}       The import engine used for importing the site
 */
export default function getSiteImportEngine( state, siteId ) {
	return get( state, [ 'sites', 'items', siteId, 'options', 'import_engine' ], null );
}
