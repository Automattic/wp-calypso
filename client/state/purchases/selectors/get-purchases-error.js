import { get } from 'lodash';

import 'calypso/state/purchases/init';

/**
 * Returns the server error for site or user purchases (if there is one)
 *
 * @param   {Object} state - current state object
 * @returns {Object} an error object from the server
 */
export const getPurchasesError = ( state ) => get( state, 'purchases.error', '' );
