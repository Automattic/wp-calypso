import { camelOrSnakeSlug } from '@automattic/calypso-products';
import { productHasStats } from 'calypso/blocks/jetpack-benefits/feature-checks';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { AppState } from 'calypso/types';

function hasSiteProductJetpackStatsPWYWOnly(
	state: AppState,
	siteId = getSelectedSiteId( state )
): boolean {
	const sitePurchases = getSitePurchases( state, siteId );

	// Get listing of all plans that support stats in some way and qualify as "paid" plans.
	const plansSupportingStats = sitePurchases?.filter(
		( product ) =>
			productHasStats( camelOrSnakeSlug( product ), true ) && product.expiryStatus !== 'expired'
	);

	if ( plansSupportingStats.length === 0 ) {
		return false;
	}

	// Check for one or more PWYW plans.
	const plansPWYWStats = plansSupportingStats?.filter( ( product ) =>
		product.productSlug.includes( 'pwyw' )
	);

	if ( plansPWYWStats.length === 0 ) {
		return false;
	}

	// PWYW plan confirmed. Check for additional paid plans.
	const plansExcludingPWYWStats = plansSupportingStats?.filter(
		( product ) => ! product.productSlug.includes( 'pwyw' )
	);

	// If we have any plans remaining, the site has paid stats.
	return plansPWYWStats.length > 0 && plansExcludingPWYWStats.length === 0;
}

export default hasSiteProductJetpackStatsPWYWOnly;
