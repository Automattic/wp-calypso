/** @format */
/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_TAXABLE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_COST,
} from 'woocommerce/state/action-types';

const initialState = {
	tax_status: 'none',
	cost: 5,
};

const reducer = {};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_TAXABLE ] = ( state, { isTaxable } ) => {
	return {
		...state,
		tax_status: isTaxable ? 'taxable' : 'none',
	};
};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_COST ] = ( state, { cost } ) => {
	return {
		...state,
		cost,
	};
};

export default createReducer( initialState, reducer );
