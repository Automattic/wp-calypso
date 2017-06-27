/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { LOADING } from 'woocommerce/state/constants';
import {
	TAXRATES_REQUEST,
	TAXRATES_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

export default createReducer( {}, {
	[ TAXRATES_REQUEST ]: () => {
		return LOADING;
	},

	[ TAXRATES_REQUEST_SUCCESS ]: ( state, { data } ) => {
		return data;
	},
} );
