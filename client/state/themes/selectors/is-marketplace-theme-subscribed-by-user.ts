import { marketplaceThemeBillingProductSlug } from 'calypso/my-sites/themes/helpers';
import { getProductsByBillingSlug } from 'calypso/state/products-list/selectors';
import { getUserPurchases } from 'calypso/state/purchases/selectors';

/**
 * Checks if the user has a subscription to the theme on any site.
 * @param {Object} state global state
 * @param {string} themeId theme id
 * @returns {boolean} true if the site subscribed to the theme
 */
export function isMarketplaceThemeSubscribedByUser( state = {}, themeId: string ) {
	const products = getProductsByBillingSlug( state, marketplaceThemeBillingProductSlug( themeId ) );
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
