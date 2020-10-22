/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/purchases/init';

/**
 * Returns the server error for site or user purchases (if there is one)
 *
 * @param   {object} state - current state object
 * @returns {object} an error object from the server
 */
export const getPurchasesError = ( state ) => get( state, 'purchases.error', '' );
