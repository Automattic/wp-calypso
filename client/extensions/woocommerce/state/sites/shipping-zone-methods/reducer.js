/** @format */
/**
 * Externals dependencies
 */
import { mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_UPDATED,
	WOOCOMMERCE_SHIPPING_ZONE_METHODS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import { createReducer } from 'state/utils';

const reducers = {};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_METHODS_REQUEST_SUCCESS ] = ( state, { data } ) => {
	const newState = { ...state };
	data.forEach( method => {
		newState[ method.id ] = {
			id: method.id,
			order: method.order,
			enabled: method.enabled,
			// The "method_id" prop name is very confusing, change it for "methodType":
			methodType: method.method_id,
			// We only care about the settings values, not their definitions
			...mapValues( method.settings, 'value' ),
		};
	} );

	return newState;
};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_UPDATED ] = ( state, { data } ) => {
	return reducers[ WOOCOMMERCE_SHIPPING_ZONE_METHODS_REQUEST_SUCCESS ]( state, { data: [ data ] } );
};

export default createReducer( {}, reducers );
