/**
 * Internal dependencies
 */

import getRawSite from 'state/selectors/get-raw-site';

/**
 * Returns true if the site is the target of an active migration
 *
 * @param {object} state Global state tree
 * @param {object} siteId Site ID
 * @returns {boolean} True if site is the target of an active migration
 */
export default function isSiteMigrationInProgress( state, siteId ) {
	const site = getRawSite( state, siteId );

	return site && site.migration_status && site.migration_status === 'migrating';
}
