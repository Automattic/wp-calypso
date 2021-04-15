/**
 * Internal dependencies
 */
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isJetpackSearch } from 'calypso/lib/products-values';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import { planHasJetpackSearch } from 'calypso/lib/plans';
import type { Purchase } from 'calypso/lib/purchases/types';

const hasSearchProduct = ( state: Record< string, unknown > ): boolean => {
	const site = getSelectedSite;
	// const siteSlug = getSelectedSiteSlug;
	const siteId = getSelectedSiteId( state );
	const checkForSearchProduct = ( purchase: Purchase ) =>
		purchase.active && isJetpackSearch( purchase );
	const sitePurchases = getSitePurchases( state, siteId );
	return !! (
		sitePurchases.find( checkForSearchProduct ) ||
		!! planHasJetpackSearch( site?.plan?.product_slug )
	);
};

export default hasSearchProduct;
