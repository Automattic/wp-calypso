import getRawSite from 'calypso/state/selectors/get-raw-site';

/**
 * Returns the migration status of the site
 *
 * @param {Object} state Global state tree
 * @param {Object} siteId Site ID
 * @returns {string} The status of the site's migration
 */
export default function getSiteMigrationStatus( state, siteId ) {
	const site = getRawSite( state, siteId );
	return site?.site_migration?.status ?? 'inactive';
}
