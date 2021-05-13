/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */

import getRawSite from 'calypso/state/selectors/get-raw-site';

/**
 * Returns the migration status of the site
 *
 * @param {object} state Global state tree
 * @param {object} siteId Site ID
 * @returns {string} The status of the site's migration
 */
export default function getSiteMigrationStatus( state, siteId ) {
	const site = getRawSite( state, siteId );

	return get( site, 'site_migration.status', 'inactive' );
}
