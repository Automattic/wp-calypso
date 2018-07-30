/** @format */

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_SERVICES_SHIPPING_CLASSES_REQUEST,
	WOOCOMMERCE_SERVICES_SHIPPING_CLASSES_REQUEST_SUCCESS,
} from 'woocommerce/woocommerce-services/state/action-types';
import { LOADING } from 'woocommerce/state/constants';

const reducers = {};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_CLASSES_REQUEST ] = () => {
	return LOADING;
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_CLASSES_REQUEST_SUCCESS ] = ( state, { data } ) => {
	return data;
};

export default createReducer( {}, reducers );
