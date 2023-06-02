import { isJetpackSearch, planHasJetpackSearch } from '@automattic/calypso-products';
import type { Purchase } from 'calypso/lib/purchases/types';

export const hasJetpackSearchPurchaseOrPlan = (
	sitePurchases: Purchase[] | null | undefined,
	planSlug: string | null | undefined
): boolean => {
	if ( ! sitePurchases || ! planSlug ) {
		return false;
	}

	const checkForSearchProductInPurchases = ( purchase: Purchase ) =>
		purchase.active && isJetpackSearch( purchase );
	return (
		!! sitePurchases.find( checkForSearchProductInPurchases ) || planHasJetpackSearch( planSlug )
	);
};
