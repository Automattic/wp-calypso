import { marketplaceThemeBillingProductSlug } from 'calypso/my-sites/themes/helpers';
import { getProductsByBillingSlug } from 'calypso/state/products-list/selectors';
import { getSitePurchases } from 'calypso/state/purchases/selectors';

/**
 * Checks if the user has a subscription to the theme.
 *
 * @param {object} state global state
 * @param {string} themeId theme id
 * @param {number} siteId site id
 * @returns {boolean} true if the user subscribed to the theme
 */
export function isMarketplaceThemeSubscribed( state = {}, themeId: string, siteId: number ) {
	const products = getProductsByBillingSlug( state, marketplaceThemeBillingProductSlug( themeId ) );

	const sitePurchases = getSitePurchases( state, siteId );

	return (
		sitePurchases &&
		sitePurchases.find( ( purchase ) => {
			return (
				products && products.find( ( product ) => purchase.productSlug === product.product_slug )
			);
		} )
	);
}
