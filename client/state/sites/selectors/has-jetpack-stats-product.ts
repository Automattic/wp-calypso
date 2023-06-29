import { productHasStats } from 'calypso/blocks/jetpack-benefits/feature-checks';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import { hasJetpackStatsPurchase } from 'calypso/state/purchases/selectors/has-jetpack-stats-purchase';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { AppState } from 'calypso/types';

const hasJetpackStatsProduct = (
	state: AppState,
	onlyPaid = false,
	siteId = getSelectedSiteId( state )
): boolean => {
	const siteHasPaidStatsPurchase = getSitePurchases( state, siteId as number ).some(
		( purchase ) => purchase.active && productHasStats( purchase?.productSlug, onlyPaid )
	);
	return hasJetpackStatsPurchase( state, siteId as number, onlyPaid ) || siteHasPaidStatsPurchase;
};

export default hasJetpackStatsProduct;
