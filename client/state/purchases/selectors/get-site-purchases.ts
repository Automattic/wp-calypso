/**
 * Internal dependencies
 */
import { getPurchases } from './get-purchases';

/**
 * Type dependencies
 */
import type { Purchase } from 'calypso/lib/purchases/types';
import type { AppState } from 'calypso/types';

import 'calypso/state/purchases/init';

/**
 * Returns a list of Purchases associated with a Site from the state using its siteId
 *
 * @param   {AppState} state global state
 * @param   {number|null|undefined} siteId the site id
 * @returns {Purchase[]} the matching purchases if there are some
 */
export const getSitePurchases = (
	state: AppState,
	siteId: number | null | undefined
): Purchase[] =>
	getPurchases( state ).filter( ( purchase: Purchase ) => purchase.siteId === siteId );
