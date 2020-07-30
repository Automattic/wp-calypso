/**
 * Internal Dependencies
 */
import { getPurchases } from './get-purchases';

import 'state/purchases/init';

/**
 * Returns a list of Purchases associated with a Site from the state using its siteId
 *
 * @param   {object} state       global state
 * @param   {number} siteId      the site id
 * @returns {object} the matching purchases if there are some
 */
export const getSitePurchases = ( state, siteId ) =>
	getPurchases( state ).filter( ( purchase ) => purchase.siteId === siteId );
