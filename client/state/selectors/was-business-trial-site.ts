import getRawSite from './get-raw-site';
import type { AppState } from 'calypso/types';

export default function wasBusinessTrialSite( state: AppState, siteId: number ) {
	const site = getRawSite( state, siteId );

	if ( ! site ) {
		return false;
	}

	return site.was_migration_trial || site.was_hosting_trial;
}
