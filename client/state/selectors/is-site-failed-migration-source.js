/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getRawSite from 'calypso/state/selectors/get-raw-site';

/**
 * Returns true if the site has recently been the source of a failed migration attempt
 *
 * @param {object} state Global state tree
 * @param {object} siteId Site ID
 * @returns {boolean} True if site has recently been the source of a failed migration
 */
export default function isSiteFailedMigrationSource( state, siteId ) {
	const site = getRawSite( state, siteId );
	const siteMigrationMeta = get( site, 'site_migration', {} );

	return !! get( siteMigrationMeta, 'failed_backup_source', false );
}
