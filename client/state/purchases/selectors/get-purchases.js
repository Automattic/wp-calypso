/**
 * Internal Dependencies
 */
import createSelector from 'lib/create-selector';
import { createPurchasesArray } from 'lib/purchases/assembler';

import 'state/purchases/init';

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
