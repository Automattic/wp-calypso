import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import hasSiteProductJetpackStats from './has-site-product-jetpack-stats';
import hasSiteProductJetpackStatsPaid from './has-site-product-jetpack-stats-paid';
import type { AppState } from 'calypso/types';

const hasSiteProductJetpackStatsFree = (
	state: AppState,
	siteId = getSelectedSiteId( state )
): boolean => {
	return (
		hasSiteProductJetpackStats( state, false, siteId ) &&
		! hasSiteProductJetpackStatsPaid( state, siteId )
	);
};

export default hasSiteProductJetpackStatsFree;
