/** @format */

/**
 * Internal dependencies
 */

import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_CURRENCY_UPDATE_SUCCESS,
	WOOCOMMERCE_CURRENCY_CHANGE,
} from 'woocommerce/state/action-types';

export const initialState = '';

function changeAction( state, { currency } ) {
	return currency;
}

function currencyUpdatedAction() {
	return null;
}

export default createReducer( initialState, {
	[ WOOCOMMERCE_CURRENCY_CHANGE ]: changeAction,
	[ WOOCOMMERCE_CURRENCY_UPDATE_SUCCESS ]: currencyUpdatedAction,
} );
