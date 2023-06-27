import { isJetpackStats, isJetpackStatsFree } from '@automattic/calypso-products';
import { getSitePurchases } from './get-site-purchases';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { AppState } from 'calypso/types';

export const hasJetpackStatsPurchase = (
	state: AppState,
	siteId: number | null,
	paid = false
): boolean => {
	const sitePurchases = getSitePurchases( state, siteId );
	if ( ! sitePurchases ) {
		return false;
	}

	const checkForStatsProductInPurchases = ( purchase: Purchase ) =>
		purchase.active && isJetpackStats( purchase ) && ! ( paid && isJetpackStatsFree( purchase ) );
	return !! sitePurchases.find( checkForStatsProductInPurchases );
};
