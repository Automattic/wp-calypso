/** @format */
/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { LOADING } from 'woocommerce/state/constants';
import {
	WOOCOMMERCE_TAXRATES_REQUEST,
	WOOCOMMERCE_TAXRATES_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

export default createReducer(
	{},
	{
		[ WOOCOMMERCE_TAXRATES_REQUEST ]: () => {
			return LOADING;
		},

		[ WOOCOMMERCE_TAXRATES_REQUEST_SUCCESS ]: ( state, { data } ) => {
			return data;
		},
	}
);
