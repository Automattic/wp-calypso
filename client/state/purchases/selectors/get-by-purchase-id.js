/**
 * Internal Dependencies
 */
import { getPurchases } from './get-purchases';

import 'calypso/state/purchases/init';

/**
 * Returns a Purchase object from the state using its id
 *
 * @param   {object} state       global state
 * @param   {number} purchaseId  the purchase id
 * @returns {import('calypso/lib/purchases/types').Purchase|undefined} the matching purchase if there is one
 */
export const getByPurchaseId = ( state, purchaseId ) =>
	getPurchases( state ).find( ( purchase ) => purchase.id === purchaseId );
