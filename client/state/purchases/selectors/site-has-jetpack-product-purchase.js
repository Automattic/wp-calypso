import { isJetpackProduct } from '@automattic/calypso-products';
import { some } from 'lodash';
import { getSitePurchases } from './get-site-purchases';

import 'calypso/state/purchases/init';

/**
 * Returns whether or not a Site has an active purchase of a Jetpack product.
 *
 * @param {Object} state global state
 * @param {number} siteId the site id
 * @returns {boolean} True if the site has an active Jetpack purchase, false otherwise.
 */
export const siteHasJetpackProductPurchase = ( state, siteId ) => {
	return some(
		getSitePurchases( state, siteId ),
		( purchase ) => purchase.active && isJetpackProduct( purchase )
	);
};
