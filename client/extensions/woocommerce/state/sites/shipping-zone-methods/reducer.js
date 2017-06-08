/**
 * Externals dependencies
 */
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SHIPPING_ZONE_METHODS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import { createReducer } from 'state/utils';

export default createReducer( {}, {
	[ WOOCOMMERCE_SHIPPING_ZONE_METHODS_REQUEST_SUCCESS ]: ( state, { data } ) => {
		const newState = { ...state };
		data.forEach( method => {
			// The "method_id" prop name is very confusing, change it for "methodType":
			newState[ method.id ] = omit( { ...method, methodType: method.method_id }, 'method_id' );
		} );

		return newState;
	},
} );
