import { MigrationStatus } from '@automattic/data-stores';
import getSiteMigrationStatus from 'calypso/state/selectors/get-site-migration-status';
import { AppState } from 'calypso/types';

/**
 * Returns true if the site is the target of an active migration.
 * Possible migration statuses: inactive, backing-up, restoring, error, done.
 * We regard 'error' as 'in progress' – the user needs to dismiss that state.
 */
export default function isSiteMigrationInProgress( state: AppState, siteId: number ) {
	const migrationStatus = getSiteMigrationStatus( state, siteId );

	return migrationStatus !== MigrationStatus.INACTIVE && migrationStatus !== MigrationStatus.DONE;
}
