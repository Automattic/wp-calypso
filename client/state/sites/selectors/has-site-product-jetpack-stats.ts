import { productHasStats } from 'calypso/blocks/jetpack-benefits/feature-checks';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { AppState } from 'calypso/types';
import getSitePlan from './get-site-plan';
import getSiteProducts from './get-site-products';

const hasSiteProductJetpackStats = (
	state: AppState,
	onlyPaid = false,
	siteId = getSelectedSiteId( state )
): boolean => {
	const siteHasStatsProduct = getSiteProducts( state, siteId )?.some(
		( product ) => ! product?.expired && productHasStats( product?.productSlug, onlyPaid )
	);
	const sitePlan = getSitePlan( state, siteId );
	const siteHasStatsPlan = productHasStats( sitePlan?.product_slug as string, onlyPaid );
	return siteHasStatsPlan || !! siteHasStatsProduct;
};

export default hasSiteProductJetpackStats;
