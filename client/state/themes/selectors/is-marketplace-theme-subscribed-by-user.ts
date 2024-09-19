import { getProductsByBillingSlug } from 'calypso/state/products-list/selectors';
import { getProductBillingSlugByThemeId } from 'calypso/state/products-list/selectors/get-product-billing-slug-by-theme-id';
import { getUserPurchases } from 'calypso/state/purchases/selectors';

/**
 * Checks if the user has a subscription to the theme on any site.
 * @param {Object} state global state
 * @param {string} themeId theme id
 * @returns {boolean} true if the site subscribed to the theme
 */
export function isMarketplaceThemeSubscribedByUser( state = {}, themeId: string ) {
	const products = getProductsByBillingSlug(
		state,
		getProductBillingSlugByThemeId( state, themeId )
	);
	const userPurchases = getUserPurchases( state );

	return !! (
		userPurchases &&
		userPurchases.find( ( purchase ) => {
			return (
				products && products.find( ( product ) => purchase.productSlug === product.product_slug )
			);
		} )
	);
}
