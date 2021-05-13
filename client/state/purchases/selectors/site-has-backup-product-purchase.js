/**
 * External dependencies
 */
import { some } from 'lodash';

/**
 * Internal Dependencies
 */
import { isJetpackBackup } from '@automattic/calypso-products';
import { getSitePurchases } from './get-site-purchases';

import 'calypso/state/purchases/init';

/**
 * Whether a site has an active Jetpack backup purchase.
 *
 * @param   {object} state       global state
 * @param   {number} siteId      the site id
 * @returns {boolean} True if the site has an active Jetpack Backup purchase, false otherwise.
 */
export const siteHasBackupProductPurchase = ( state, siteId ) => {
	return some(
		getSitePurchases( state, siteId ),
		( purchase ) => purchase.active && isJetpackBackup( purchase )
	);
};
