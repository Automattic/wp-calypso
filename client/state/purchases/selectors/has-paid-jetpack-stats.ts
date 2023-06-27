import { hasJetpackStatsPurchase } from './has-jetpack-stats-purchase';
import type { AppState } from 'calypso/types';

export const hasPaidJetpackStats = ( state: AppState, siteId: number | null ): boolean => {
	return hasJetpackStatsPurchase( state, siteId, true );
};
