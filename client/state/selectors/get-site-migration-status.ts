import { MigrationStatus, MigrationStatusError } from '@automattic/data-stores';
import getRawSite from 'calypso/state/selectors/get-raw-site';
import { AppState } from 'calypso/types';

/**
 * Returns the migration status of the site or the error status if there is one.
 */
export default function getSiteMigrationStatus(
	state: AppState,
	siteId: number,
	outputErrorStatus = true
): MigrationStatus | MigrationStatusError {
	const site = getRawSite( state, siteId );

	// Output the error status if there is one.
	if ( outputErrorStatus && site?.site_migration?.error_status ) {
		return site.site_migration.error_status;
	}

	return site?.site_migration?.status ?? MigrationStatus.INACTIVE;
}
