import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import hasSiteProductJetpackStats from './has-site-product-jetpack-stats';
import type { AppState } from 'calypso/types';

const hasSiteProductJetpackStatsPaid = (
	state: AppState,
	siteId = getSelectedSiteId( state )
): boolean => {
	return hasSiteProductJetpackStats( state, true, siteId );
};

export default hasSiteProductJetpackStatsPaid;
