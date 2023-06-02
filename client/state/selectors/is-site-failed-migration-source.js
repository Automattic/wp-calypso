import getRawSite from 'calypso/state/selectors/get-raw-site';

/**
 * Returns true if the site has recently been the source of a failed migration attempt
 *
 * @param {Object} state Global state tree
 * @param {Object} siteId Site ID
 * @returns {boolean} True if site has recently been the source of a failed migration
 */
export default function isSiteFailedMigrationSource( state, siteId ) {
	const site = getRawSite( state, siteId );
	return site?.site_migration?.failed_backup_source ?? false;
}
