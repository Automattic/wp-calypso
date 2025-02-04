import getRawSite from './get-raw-site';
import type { AppState } from 'calypso/types';

export default function wasMigrationTrialSite(
	state: AppState,
	siteId: number | null | undefined
) {
	if ( ! siteId ) {
		return false;
	}

	const site = getRawSite( state, siteId );
	return site?.was_migration_trial ?? false;
}
