/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_REQUEST,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import { LOADING } from 'woocommerce/state/constants';
import { createReducer } from 'state/utils';

export default createReducer( {}, {
	[ WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_REQUEST ]: ( state, { zoneId } ) => {
		return { ...state,
			[ zoneId ]: LOADING,
		};
	},

	[ WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_REQUEST_SUCCESS ]: ( state, { data, zoneId } ) => {
		const locations = {
			continent: [],
			country: [],
			state: [],
			postcode: [],
		};
		data.forEach( ( { type, code } ) => locations[ type ].push( code ) );
		return { ...state,
			[ zoneId ]: locations,
		};
	},
} );
