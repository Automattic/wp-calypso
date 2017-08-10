/** @format */
/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { WOOCOMMERCE_CURRENCY_CHANGE } from '../../../action-types';

export const initialState = '';

function changeAction( state, { currency } ) {
	return currency;
}

export default createReducer( initialState, {
	[ WOOCOMMERCE_CURRENCY_CHANGE ]: changeAction,
} );
