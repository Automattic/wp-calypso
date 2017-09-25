/**
 * Internal dependencies
 */
import { WOOCOMMERCE_CURRENCY_CHANGE } from '../../../action-types';
import { createReducer } from 'state/utils';

export const initialState = '';

function changeAction( state, { currency } ) {
	return currency;
}

export default createReducer( initialState, {
	[ WOOCOMMERCE_CURRENCY_CHANGE ]: changeAction,
} );
