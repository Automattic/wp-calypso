import { getSite } from '../sites/selectors';
import type { AppState } from 'calypso/types';

export default function wasBusinessTrialSite( state: AppState, siteId: number ) {
	const site = getSite( state, siteId );

	return site?.was_migration_trial === true;
}
