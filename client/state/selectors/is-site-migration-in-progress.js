/**
 * Internal dependencies
 */

import getSiteMigrationStatus from 'calypso/state/selectors/get-site-migration-status';

/**
 * Returns true if the site is the target of an active migration.
 * Possible migration statuses: inactive, backing-up, restoring, error, done.
 * We regard 'error' as 'in progress' – the user needs to dismiss that
 * state.
 *
 * @param {object} state Global state tree
 * @param {object} siteId Site ID
 * @returns {boolean} True if site is the target of an active migration
 */
export default function isSiteMigrationInProgress( state, siteId ) {
	const migrationStatus = getSiteMigrationStatus( state, siteId );

	return migrationStatus !== 'inactive' && migrationStatus !== 'done';
}
