/**
 * Internal dependencies
 */

import getSiteMigrationStatus from 'state/selectors/get-site-migration-status';

/**
 * Returns true if the site is the target of an active migration
 *
 * @param {object} state Global state tree
 * @param {object} siteId Site ID
 * @returns {boolean} True if site is the target of an active migration
 */
/* eslint-disable */
export default function isSiteMigrationInProgress( state, siteId ) {
	const site = getRawSite( state, siteId );

	return site && site.migration_status && site.migration_status === 'migrating';
}
/* eslint-enable */
