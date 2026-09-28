import { camelOrSnakeSlug } from '@automattic/calypso-products';
import { productHasStats } from 'calypso/blocks/jetpack-benefits/feature-checks';
import { isRemoved } from 'calypso/dashboard/utils/purchase';
import { getRawSitePurchases } from 'calypso/state/purchases/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { AppState } from 'calypso/types';

function hasSiteProductJetpackStatsPWYWOnly(
	state: AppState,
	siteId = getSelectedSiteId( state )
): boolean {
	const sitePurchases = getRawSitePurchases( state, siteId );

	// Get listing of all plans that support stats in some way and qualify as "paid" plans.
	const plansSupportingStats = sitePurchases?.filter(
		( product ) => productHasStats( camelOrSnakeSlug( product ), true ) && ! isRemoved( product )
	);

	if ( plansSupportingStats.length === 0 ) {
		return false;
	}

	// Check for one or more PWYW plans.
	const plansPWYWStats = plansSupportingStats?.filter( ( product ) =>
		product.product_slug.includes( 'pwyw' )
	);

	// If the arrays are equal, the site has only PWYW stats.
	return plansSupportingStats.length === plansPWYWStats.length;
}

export default hasSiteProductJetpackStatsPWYWOnly;
