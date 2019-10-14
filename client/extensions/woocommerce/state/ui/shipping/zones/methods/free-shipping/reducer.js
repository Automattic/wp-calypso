/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_CONDITION,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_MIN_COST,
} from 'woocommerce/state/action-types';

const initialState = {
	requires: '',
	min_amount: 0,
};

export default function( state = initialState, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_CONDITION:
			return {
				...state,
				requires: action.condition,
			};

		case WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_MIN_COST:
			return {
				...state,
				min_amount: action.cost,
			};
	}
	return state;
}
