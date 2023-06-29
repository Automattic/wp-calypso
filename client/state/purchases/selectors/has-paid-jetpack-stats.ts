import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { hasJetpackStatsPurchase } from './has-jetpack-stats-purchase';
import type { AppState } from 'calypso/types';

export const hasPaidJetpackStats = (
	state: AppState,
	siteId = getSelectedSiteId( state )
): boolean => {
	return hasJetpackStatsPurchase( state, true, siteId );
};
