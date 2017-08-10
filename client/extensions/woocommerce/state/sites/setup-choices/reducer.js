/** @format */
/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { LOADING } from 'woocommerce/state/constants';
import {
	WOOCOMMERCE_SETUP_CHOICE_UPDATE_REQUEST_SUCCESS,
	WOOCOMMERCE_SETUP_CHOICES_REQUEST,
	WOOCOMMERCE_SETUP_CHOICES_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

// TODO: Handle error

export default createReducer(
	{},
	{
		[ WOOCOMMERCE_SETUP_CHOICES_REQUEST ]: () => {
			return LOADING;
		},

		[ WOOCOMMERCE_SETUP_CHOICES_REQUEST_SUCCESS ]: ( state, { data } ) => {
			return data;
		},

		[ WOOCOMMERCE_SETUP_CHOICE_UPDATE_REQUEST_SUCCESS ]: ( state, { data } ) => {
			return data;
		},
	}
);
