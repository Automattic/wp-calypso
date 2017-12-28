/** @format */

/**
 * Internal dependencies
 */

import { createReducer } from 'client/state/utils';
import { LOADING } from 'client/extensions/woocommerce/state/constants';
import {
	WOOCOMMERCE_TAXRATES_REQUEST,
	WOOCOMMERCE_TAXRATES_REQUEST_SUCCESS,
} from 'client/extensions/woocommerce/state/action-types';

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
