/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SHIPPING_ZONE_DELETED,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_REQUEST,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_REQUEST_SUCCESS,
	WOOCOMMERCE_SHIPPING_ZONE_UPDATED,
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

	[ WOOCOMMERCE_SHIPPING_ZONE_UPDATED ]: ( state, { data, originatingAction: { zone } } ) => {
		if ( 'number' === typeof zone.id ) {
			return state;
		}

		return { ...state,
			[ data.id ]: {
				continent: [],
				country: [],
				state: [],
				postcode: [],
			},
		};
	},

	[ WOOCOMMERCE_SHIPPING_ZONE_DELETED ]: ( state, { originatingAction: { zone } } ) => {
		const newState = { ...state };
		delete newState[ zone.id ];
		return newState;
	},
} );
