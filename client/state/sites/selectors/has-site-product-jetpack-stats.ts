import { camelOrSnakeSlug } from '@automattic/calypso-products';
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
		( product ) => productHasStats( camelOrSnakeSlug( product ), onlyPaid ) && ! product.expired
	);
	const sitePlan = getSitePlan( state, siteId );
	const siteHasStatsPlan = productHasStats( sitePlan?.product_slug as string, onlyPaid );
	return siteHasStatsPlan || !! siteHasStatsProduct;
};

export default hasSiteProductJetpackStats;
