import { MigrationStatus, MigrationStatusError } from '@automattic/data-stores';
import getRawSite from 'calypso/state/selectors/get-raw-site';
import { AppState } from 'calypso/types';

/**
 * Returns the migration status of the site.
 */
export default function getSiteMigrationStatus(
	state: AppState,
	siteId: number
): MigrationStatus | MigrationStatusError {
	const site = getRawSite( state, siteId );

	return site?.site_migration?.status ?? MigrationStatus.INACTIVE;
}
