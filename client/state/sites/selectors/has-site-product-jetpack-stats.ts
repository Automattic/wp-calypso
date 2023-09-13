import { camelOrSnakeSlug } from '@automattic/calypso-products';
import { productHasStats } from 'calypso/blocks/jetpack-benefits/feature-checks';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { AppState } from 'calypso/types';
import getSitePlan from './get-site-plan';

// TODO: Move this selector outside of state/sites since we now use state/purchases to check the Stats product.
const hasSiteProductJetpackStats = (
	state: AppState,
	onlyPaid = false,
	siteId = getSelectedSiteId( state )
): boolean => {
	const siteHasStatsProduct = getSitePurchases( state, siteId )?.some(
		( product ) =>
			productHasStats( camelOrSnakeSlug( product ), onlyPaid ) && product.expiryStatus !== 'expired'
	);

	const sitePlan = getSitePlan( state, siteId );
	const siteHasStatsPlan = productHasStats( sitePlan?.product_slug as string, onlyPaid );

	return siteHasStatsPlan || !! siteHasStatsProduct;
};

export default hasSiteProductJetpackStats;
