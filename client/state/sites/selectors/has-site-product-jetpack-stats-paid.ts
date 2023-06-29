import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { AppState } from 'calypso/types';
import hasSiteProductJetpackStats from './has-site-product-jetpack-stats';

export const hasPaidJetpackStats = (
	state: AppState,
	siteId = getSelectedSiteId( state )
): boolean => {
	return hasSiteProductJetpackStats( state, true, siteId );
};
