import hasJetpackStatsProduct from 'calypso/state/sites/selectors/has-jetpack-stats-product';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { AppState } from 'calypso/types';

const hasJetpackStatsProductPaid = (
	state: AppState,
	siteId = getSelectedSiteId( state )
): boolean => hasJetpackStatsProduct( state, true, siteId );

export default hasJetpackStatsProductPaid;
