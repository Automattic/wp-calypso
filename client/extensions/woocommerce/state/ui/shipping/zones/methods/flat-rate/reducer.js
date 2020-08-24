/**
 * Internal dependencies
 */
import { withoutPersistence } from 'state/utils';
import {
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_TAXABLE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_COST,
} from 'woocommerce/state/action-types';

const initialState = {
	tax_status: 'none',
	cost: 5,
};

export default withoutPersistence( function ( state = initialState, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_TAXABLE:
			return {
				...state,
				tax_status: action.isTaxable ? 'taxable' : 'none',
			};

		case WOOCOMMERCE_SHIPPING_ZONE_METHOD_SET_COST:
			return {
				...state,
				cost: action.cost,
			};
	}

	return state;
} );
