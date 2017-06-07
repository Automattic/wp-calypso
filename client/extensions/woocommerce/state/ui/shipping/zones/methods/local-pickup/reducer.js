/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_TAXABLE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_COST,
} from 'woocommerce/state/action-types';

const initialState = {
	taxable: 'None',
	cost: 0,
};

const reducer = {};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_TAXABLE ] = ( state, { payload: { isTaxable } } ) => {
	return { ...state,
		taxable: isTaxable ? 'Taxable' : 'None',
	};
};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_COST ] = ( state, { payload: { cost } } ) => {
	return { ...state,
		cost,
	};
};

export default createReducer( initialState, reducer );
