/** @format */

/**
 * Internal dependencies
 */

import { createReducer, keyedReducer } from 'state/utils';
import {
	WOOCOMMERCE_SERVICES_SHIPPING_METHOD_SCHEMA_REQUEST,
	WOOCOMMERCE_SERVICES_SHIPPING_METHOD_SCHEMA_REQUEST_SUCCESS,
} from 'woocommerce/woocommerce-services/state/action-types';
import { LOADING } from 'woocommerce/state/constants';

const reducer = createReducer( null, {
	[ WOOCOMMERCE_SERVICES_SHIPPING_METHOD_SCHEMA_REQUEST ]: () => {
		return LOADING;
	},

	[ WOOCOMMERCE_SERVICES_SHIPPING_METHOD_SCHEMA_REQUEST_SUCCESS ]: ( state, { data } ) => {
		return data;
	},
} );

export default keyedReducer( 'methodId', reducer );
