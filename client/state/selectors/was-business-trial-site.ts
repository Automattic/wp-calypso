import getRawSite from './get-raw-site';
import type { AppState } from 'calypso/types';

export default function wasBusinessTrialSite( state: AppState, siteId: number ) {
	const site = getRawSite( state, siteId );

	return site?.plan?.is_free && site?.was_migration_trial;
}
