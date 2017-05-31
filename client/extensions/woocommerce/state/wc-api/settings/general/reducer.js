/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_API_FETCH_SETTINGS_GENERAL,
	WOOCOMMERCE_API_FETCH_SETTINGS_GENERAL_SUCCESS,
} from 'woocommerce/state/action-types';

export const LOADING = 'LOADING';

// TODO: Handle error

export default {
	[ WOOCOMMERCE_API_FETCH_SETTINGS_GENERAL ]: ( state ) => {
		return { ...state,
			settingsGeneral: LOADING,
		};
	},

	[ WOOCOMMERCE_API_FETCH_SETTINGS_GENERAL_SUCCESS ]: ( state, { payload: { data } } ) => {
		return { ...state,
			settingsGeneral: data,
		};
	},
};
