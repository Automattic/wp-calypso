import { isJetpackProduct } from '@automattic/calypso-products';
import { getRawSitePurchases } from './get-raw-site-purchases';

import 'calypso/state/purchases/init';

/**
 * Returns whether or not a Site has an active purchase of a Jetpack product.
 * @param {Object} state global state
 * @param {number} siteId the site id
 * @returns {boolean} True if the site has an active Jetpack purchase, false otherwise.
 */
export const siteHasJetpackProductPurchase = ( state, siteId ) => {
	return getRawSitePurchases( state, siteId ).some( ( purchase ) => isJetpackProduct( purchase ) );
};
