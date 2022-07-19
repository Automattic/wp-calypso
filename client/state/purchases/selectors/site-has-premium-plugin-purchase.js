import { getProductsList } from 'calypso/state/products-list/selectors';
import { getSitePurchases } from './get-site-purchases';

import 'calypso/state/purchases/init';

/**
 * Returns whether a site has purchased a premium plugin.
 *
 * @param {object} state global state
 * @param {number} siteId the site id
 * @param {string} pluginSlug the plugin slug
 * @returns {boolean} True if the site has an active purchase for the given plugin, false otherwise.
 */
export const siteHasPremiumPluginPurchase = ( state, siteId, pluginSlug ) => {
	if ( ! siteId || ! pluginSlug ) {
		return false;
	}

	const purchases = getSitePurchases( state, siteId );
	const purchasedProductIds = purchases.map( ( { productId } ) => productId );
	const products = getProductsList( state );
	return Object.values( products ).some(
		( { billing_product_slug, product_id, product_slug } ) =>
			purchasedProductIds.includes( product_id ) &&
			( pluginSlug === product_slug || pluginSlug === billing_product_slug )
	);
};
