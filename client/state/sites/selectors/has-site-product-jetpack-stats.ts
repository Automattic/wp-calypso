import { camelOrSnakeSlug } from '@automattic/calypso-products';
import { productHasStats } from 'calypso/blocks/jetpack-benefits/feature-checks';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import isSiteOnPaidPlan from 'calypso/state/selectors/is-site-on-paid-plan';
import isSiteWpcom from 'calypso/state/selectors/is-site-wpcom';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { AppState } from 'calypso/types';
import getSitePlan from './get-site-plan';

// TODO: Move this selector outside of state/sites since we now use state/purchases to check the Stats product.
const hasSiteProductJetpackStats = (
	state: AppState,
	onlyPaid = false,
	siteId = getSelectedSiteId( state )
): boolean => {
	const isWpcomSite = !! isSiteWpcom( state, siteId );

	const siteHasStatsProduct = getSitePurchases( state, siteId )?.some(
		( product ) =>
			productHasStats( camelOrSnakeSlug( product ), onlyPaid ) && product.expiryStatus !== 'expired'
	);

	const sitePlan = getSitePlan( state, siteId );
	const siteHasStatsPlan = productHasStats( sitePlan?.product_slug as string, onlyPaid );

	// Check whether sites have paid plans of WPCOM.
	const siteHasPaidPlan = isSiteOnPaidPlan( state, siteId || 0 );
	// TODO: Determine the proper way to check WPCOM plans for supporting Stats.
	const wpcomSiteHasPaidPlan = isWpcomSite && siteHasPaidPlan;

	return siteHasStatsPlan || !! siteHasStatsProduct || wpcomSiteHasPaidPlan;
};

export default hasSiteProductJetpackStats;
