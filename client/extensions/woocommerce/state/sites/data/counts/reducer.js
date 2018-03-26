/** @format */
/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_COUNT_REQUEST,
	WOOCOMMERCE_COUNT_REQUEST_SUCCESS,
	WOOCOMMERCE_COUNT_REQUEST_FAILURE,
} from 'woocommerce/state/action-types';
import { LOADING } from 'woocommerce/state/constants';

export default createReducer( null, {
	[ WOOCOMMERCE_COUNT_REQUEST ]: () => {
		return LOADING;
	},

	[ WOOCOMMERCE_COUNT_REQUEST_SUCCESS ]: ( state, { counts } ) => {
		return counts;
	},

	[ WOOCOMMERCE_COUNT_REQUEST_FAILURE ]: () => {
		return false;
	},
} );
