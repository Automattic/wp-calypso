import { productHasStats } from 'calypso/blocks/jetpack-benefits/feature-checks';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getSitePurchases } from './get-site-purchases';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { AppState } from 'calypso/types';

export const hasJetpackStatsPurchase = (
	state: AppState,
	onlyPaid = false,
	siteId = getSelectedSiteId( state )
): boolean => {
	const sitePurchases = getSitePurchases( state, siteId );
	if ( ! sitePurchases ) {
		return false;
	}

	const checkForStatsProductInPurchases = ( purchase: Purchase ) =>
		purchase?.active && productHasStats( purchase?.productSlug, onlyPaid );
	return !! sitePurchases.find( checkForStatsProductInPurchases );
};
