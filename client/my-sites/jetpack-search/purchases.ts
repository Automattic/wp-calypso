/**
 * Internal dependencies
 */
import { isJetpackSearch, planHasJetpackSearch } from '@automattic/calypso-products';

export const hasJetpackSearchPurchaseOrPlan = (
	sitePurchases: Record< string, unknown >[] | null,
	planSlug: string | null
): boolean => {
	if ( ! sitePurchases || ! planSlug ) {
		return false;
	}

	const checkForSearchProductInPurchases = ( purchase ) =>
		purchase.active && isJetpackSearch( purchase );
	return (
		!! sitePurchases.find( checkForSearchProductInPurchases ) || planHasJetpackSearch( planSlug )
	);
};
