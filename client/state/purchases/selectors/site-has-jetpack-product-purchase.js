/**
 * External dependencies
 */
import { some } from 'lodash';

/**
 * Internal Dependencies
 */
import { isJetpackProduct } from '@automattic/calypso-products';
import { getSitePurchases } from './get-site-purchases';

import 'calypso/state/purchases/init';

/**
 * Returns whether or not a Site has an active purchase of a Jetpack product.
 *
 * @param {object} state global state
 * @param {number} siteId the site id
 * @returns {boolean} True if the site has an active Jetpack purchase, false otherwise.
 */
export const siteHasJetpackProductPurchase = ( state, siteId ) => {
	return some(
		getSitePurchases( state, siteId ),
		( purchase ) => purchase.active && isJetpackProduct( purchase )
	);
};
