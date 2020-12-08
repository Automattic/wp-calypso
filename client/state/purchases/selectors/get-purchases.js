/**
 * Internal Dependencies
 */
import createSelector from 'calypso/lib/create-selector';
import { createPurchasesArray } from 'calypso/lib/purchases/assembler';

import 'calypso/state/purchases/init';

/**
 * Return the list of purchases from state object
 *
 * @param   {object} state - current state object
 * @returns {Array} Purchases
 */
export const getPurchases = createSelector(
	( state ) => createPurchasesArray( state.purchases.data ),
	( state ) => [ state.purchases.data ]
);
