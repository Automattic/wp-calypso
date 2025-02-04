import getRawSite from 'calypso/state/selectors/get-raw-site';
import type { AppState } from 'calypso/types';

export default function wasUpgradedFromTrialSite( state: AppState, siteId: number ) {
	const site = getRawSite( state, siteId );

	return site?.was_upgraded_from_trial === true;
}
