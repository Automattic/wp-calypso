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
import { withoutPersistence } from 'calypso/state/utils';

function handleLocationsRequest( state, { zoneId } ) {
	return {
		...state,
		[ zoneId ]: LOADING,
	};
}

function handleLocationsRequestSuccess( state, { data, zoneId } ) {
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
}

function handleLocationsUpdated( state, { data, originatingAction: { zoneId } } ) {
	return handleLocationsRequestSuccess( state, { data, zoneId } );
}

function handleZoneUpdated( state, { data, originatingAction: { zone } } ) {
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
}

function handleZoneDeleted( state, { originatingAction: { zone } } ) {
	const newState = { ...state };
	delete newState[ zone.id ];
	return newState;
}

export default withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_REQUEST:
			return handleLocationsRequest( state, action );

		case WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_REQUEST_SUCCESS:
			return handleLocationsRequestSuccess( state, action );

		case WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_UPDATED:
			return handleLocationsUpdated( state, action );

		case WOOCOMMERCE_SHIPPING_ZONE_UPDATED:
			return handleZoneUpdated( state, action );

		case WOOCOMMERCE_SHIPPING_ZONE_DELETED:
			return handleZoneDeleted( state, action );
	}
	return state;
} );
