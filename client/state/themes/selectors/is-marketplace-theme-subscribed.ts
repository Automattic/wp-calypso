import { getProductsByBillingSlug } from 'calypso/state/products-list/selectors';
import { getProductBillingSlugByThemeId } from 'calypso/state/products-list/selectors/get-product-billing-slug-by-theme-id';
import { getSitePurchases } from 'calypso/state/purchases/selectors';

/**
 * Checks if the site has a subscription to the theme.
 * @param {Object} state global state
 * @param {string} themeId theme id
 * @param {number} siteId site id
 * @returns {boolean} true if the site subscribed to the theme
 */
export function isMarketplaceThemeSubscribed( state = {}, themeId: string, siteId: number ) {
	const products = getProductsByBillingSlug(
		state,
		getProductBillingSlugByThemeId( state, themeId )
	);

	const sitePurchases = getSitePurchases( state, siteId );

	return !! (
		sitePurchases &&
		sitePurchases.find( ( purchase ) => {
			return (
				products && products.find( ( product ) => purchase.productSlug === product.product_slug )
			);
		} )
	);
}
