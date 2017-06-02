/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_API_FETCH_SHIPPING_ZONES,
	WOOCOMMERCE_API_FETCH_SHIPPING_ZONES_SUCCESS,
} from 'woocommerce/state/action-types';

export const LOADING = 'LOADING';

// TODO: Handle error

export default {
	[ WOOCOMMERCE_API_FETCH_SHIPPING_ZONES ]: ( state ) => {
		return { ...state,
			shippingZones: LOADING,
		};
	},

	[ WOOCOMMERCE_API_FETCH_SHIPPING_ZONES_SUCCESS ]: ( state, { payload: { data } } ) => {
		return { ...state,
			shippingZones: data,
		};
	},
};
