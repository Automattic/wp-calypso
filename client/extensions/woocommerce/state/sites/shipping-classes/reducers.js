/** @format */

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_SHIPPING_CLASSES_REQUEST,
	WOOCOMMERCE_SHIPPING_CLASSES_REQUEST_SUCCESS,
	WOOCOMMERCE_SHIPPING_CLASS_DELETE,
	WOOCOMMERCE_SHIPPING_CLASS_DELETED,
	WOOCOMMERCE_SHIPPING_CLASS_UPDATED,
	WOOCOMMERCE_SHIPPING_CLASS_CREATED,
} from 'woocommerce/state/action-types';
import { LOADING } from 'woocommerce/state/constants';

const reducers = {};

reducers[ WOOCOMMERCE_SHIPPING_CLASSES_REQUEST ] = () => {
	return LOADING;
};

reducers[ WOOCOMMERCE_SHIPPING_CLASSES_REQUEST_SUCCESS ] = ( state, { data } ) => {
	return data;
};

reducers[ WOOCOMMERCE_SHIPPING_CLASS_DELETE ] = ( state, { classId } ) => {
	return state.map( shippingClass => {
		return shippingClass.id === classId ? { ...shippingClass, deleting: true } : shippingClass;
	} );
};

reducers[ WOOCOMMERCE_SHIPPING_CLASS_UPDATED ] = ( state, { data } ) => {
	return state.map( shippingClass => {
		return shippingClass.id === data.id ? data : shippingClass;
	} );
};

reducers[ WOOCOMMERCE_SHIPPING_CLASS_CREATED ] = ( state, { data } ) => {
	return [ ...state, data ];
};

reducers[ WOOCOMMERCE_SHIPPING_CLASS_DELETED ] = ( state, { classId } ) => {
	return state.filter( shippingClass => shippingClass.id !== classId );
};

export default createReducer( {}, reducers );
