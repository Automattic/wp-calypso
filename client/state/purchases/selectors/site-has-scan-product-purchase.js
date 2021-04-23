/**
 * External dependencies
 */
import { some } from 'lodash';

/**
 * Internal Dependencies
 */
import { isJetpackScan } from 'calypso/lib/products-values';
import { getSitePurchases } from './get-site-purchases';

import 'calypso/state/purchases/init';

/**
 * Whether a site has an active Jetpack Scan purchase.
 *
 * @param   {object} state       global state
 * @param   {number} siteId      the site id
 * @returns {boolean} True if the site has an active Jetpack Scan purchase, false otherwise.
 */
export const siteHasScanProductPurchase = ( state, siteId ) => {
	return some(
		getSitePurchases( state, siteId ),
		( purchase ) => purchase.active && isJetpackScan( purchase )
	);
};
