/**
 * Internal dependencies
 */
import { isJetpackSearch, planHasJetpackSearch } from '@automattic/calypso-products';

export function hasJetpackSearchPurchaseOrPlan( sitePurchases, planSlug ) {
	if ( ! sitePurchases || ! planSlug ) {
		return;
	}

	const checkForSearchProductInPurchases = ( purchase ) =>
		purchase.active && isJetpackSearch( purchase );
	return (
		!! sitePurchases.find( checkForSearchProductInPurchases ) || planHasJetpackSearch( planSlug )
	);
}
