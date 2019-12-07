/** @format */

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_SHIPPING_CLASSES_REQUEST,
	WOOCOMMERCE_SHIPPING_CLASSES_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import { LOADING } from 'woocommerce/state/constants';

const reducers = {};

reducers[ WOOCOMMERCE_SHIPPING_CLASSES_REQUEST ] = () => {
	return LOADING;
};

reducers[ WOOCOMMERCE_SHIPPING_CLASSES_REQUEST_SUCCESS ] = ( state, { data } ) => {
	return data;
};

export default createReducer( {}, reducers );
