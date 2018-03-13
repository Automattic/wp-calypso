/** @format */

/**
 * Internal dependencies
 */

import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_SERVICES_SHIPPING_ZONE_METHOD_SETTINGS_REQUEST,
	WOOCOMMERCE_SERVICES_SHIPPING_ZONE_METHOD_SETTINGS_REQUEST_SUCCESS,
} from 'woocommerce/woocommerce-services/state/action-types';
import { LOADING } from 'woocommerce/state/constants';
import { WOOCOMMERCE_SHIPPING_ZONE_METHOD_UPDATED } from 'woocommerce/state/action-types';

const reducers = {};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_ZONE_METHOD_SETTINGS_REQUEST ] = (
	state,
	{ instanceId }
) => {
	return {
		...state,
		[ instanceId ]: LOADING,
	};
};

reducers[ WOOCOMMERCE_SERVICES_SHIPPING_ZONE_METHOD_SETTINGS_REQUEST_SUCCESS ] = (
	state,
	{ instanceId }
) => {
	return {
		...state,
		[ instanceId ]: true,
	};
};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_UPDATED ] = ( state, { data } ) => {
	return reducers[ WOOCOMMERCE_SERVICES_SHIPPING_ZONE_METHOD_SETTINGS_REQUEST_SUCCESS ]( state, {
		instanceId: data.id,
	} );
};

export default createReducer( {}, reducers );
