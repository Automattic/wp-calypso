import { MigrationStatusError } from '@automattic/data-stores';
import getRawSite from 'calypso/state/selectors/get-raw-site';
import { AppState } from 'calypso/types';

/**
 * Returns the migration error status if there is one.
 */
export default function getSiteMigrationErrorStatus(
	state: AppState,
	siteId: number
): MigrationStatusError | null {
	const site = getRawSite( state, siteId );

	return site?.site_migration?.error_status ?? null;
}
