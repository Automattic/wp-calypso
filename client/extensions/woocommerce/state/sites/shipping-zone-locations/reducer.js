/** @format */
/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SHIPPING_ZONE_DELETED,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_REQUEST,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_REQUEST_SUCCESS,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_UPDATED,
	WOOCOMMERCE_SHIPPING_ZONE_UPDATED,
} from 'woocommerce/state/action-types';
import { LOADING } from 'woocommerce/state/constants';
import { createReducer } from 'state/utils';

const reducers = {};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_REQUEST ] = ( state, { zoneId } ) => {
	return {
		...state,
		[ zoneId ]: LOADING,
	};
};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_REQUEST_SUCCESS ] = ( state, { data, zoneId } ) => {
	const locations = {
		continent: [],
		country: [],
		state: [],
		postcode: [],
	};
	data.forEach( ( { type, code } ) => locations[ type ].push( code ) );
	return {
		...state,
		[ zoneId ]: locations,
	};
};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_UPDATED ] = (
	state,
	{ data, originatingAction: { zoneId } }
) => {
	return reducers[ WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_REQUEST_SUCCESS ]( state, { data, zoneId } );
};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_UPDATED ] = (
	state,
	{ data, originatingAction: { zone } }
) => {
	if ( 'number' === typeof zone.id ) {
		return state;
	}

	return {
		...state,
		[ data.id ]: {
			continent: [],
			country: [],
			state: [],
			postcode: [],
		},
	};
};

reducers[ WOOCOMMERCE_SHIPPING_ZONE_DELETED ] = ( state, { originatingAction: { zone } } ) => {
	const newState = { ...state };
	delete newState[ zone.id ];
	return newState;
};

export default createReducer( {}, reducers );
