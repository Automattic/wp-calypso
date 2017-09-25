/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_CONDITION, WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_MIN_COST } from 'woocommerce/state/action-types';

const initialState = {
	requires: '',
	min_amount: 0,
};

const reducer = {};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_CONDITION ] = ( state, { condition } ) => {
	return { ...state,
		requires: condition,
	};
};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_MIN_COST ] = ( state, { cost } ) => {
	return { ...state,
		min_amount: cost,
	};
};

export default createReducer( initialState, reducer );
