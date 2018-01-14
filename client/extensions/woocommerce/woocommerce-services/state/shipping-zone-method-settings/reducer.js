/** @format */

/**
 * Internal dependencies
 */

import { createReducer, keyedReducer } from 'state/utils';
import {
	WOOCOMMERCE_SERVICES_SHIPPING_ZONE_METHOD_SETTINGS_REQUEST,
	WOOCOMMERCE_SERVICES_SHIPPING_ZONE_METHOD_SETTINGS_REQUEST_SUCCESS,
} from 'woocommerce/woocommerce-services/state/action-types';
import { LOADING } from 'woocommerce/state/constants';

const reducer = createReducer( null, {
	[ WOOCOMMERCE_SERVICES_SHIPPING_ZONE_METHOD_SETTINGS_REQUEST ]: () => {
		return LOADING;
	},

	[ WOOCOMMERCE_SERVICES_SHIPPING_ZONE_METHOD_SETTINGS_REQUEST_SUCCESS ]: () => {
		return true;
	},
} );

export default keyedReducer( 'instanceId', reducer );
