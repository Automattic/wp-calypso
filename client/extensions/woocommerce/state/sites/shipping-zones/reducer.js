/** @format */

/**
 * External dependencies
 */

import { findIndex, isArray } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { createReducer } from 'client/state/utils';
import { LOADING } from 'client/extensions/woocommerce/state/constants';
import {
	WOOCOMMERCE_SHIPPING_ZONE_DELETED,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_DELETED,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_UPDATED,
	WOOCOMMERCE_SHIPPING_ZONE_METHODS_REQUEST,
	WOOCOMMERCE_SHIPPING_ZONE_METHODS_REQUEST_SUCCESS,
	WOOCOMMERCE_SHIPPING_ZONE_UPDATED,
	WOOCOMMERCE_SHIPPING_ZONES_REQUEST,
	WOOCOMMERCE_SHIPPING_ZONES_REQUEST_SUCCESS,
} from 'client/extensions/woocommerce/state/action-types';

// TODO: Handle error

const processZoneData = zoneData => {
	if ( 0 !== zoneData.id ) {
		return zoneData;
	}
	return { ...zoneData, name: translate( 'Locations not covered by your other zones' ) };
};

export default createReducer( null, {
	[ WOOCOMMERCE_SHIPPING_ZONE_METHODS_REQUEST ]: ( state, { zoneId } ) => {
		if ( ! isArray( state ) ) {
			return state;
		}
		const zoneIndex = findIndex( state, { id: zoneId } );
		if ( -1 === zoneIndex ) {
			return state;
		}

		const zone = {
			...state[ zoneIndex ],
			methodIds: LOADING,
		};
		return [ ...state.slice( 0, zoneIndex ), zone, ...state.slice( zoneIndex + 1 ) ];
	},

	[ WOOCOMMERCE_SHIPPING_ZONE_METHODS_REQUEST_SUCCESS ]: ( state, { zoneId, data } ) => {
		if ( ! isArray( state ) ) {
			return state;
		}
		const zoneIndex = findIndex( state, { id: zoneId } );
		if ( -1 === zoneIndex ) {
			return state;
		}

		const zone = {
			...state[ zoneIndex ],
			methodIds: data.map( method => method.id ),
		};

		return [ ...state.slice( 0, zoneIndex ), zone, ...state.slice( zoneIndex + 1 ) ];
	},

	[ WOOCOMMERCE_SHIPPING_ZONE_UPDATED ]: ( state, { data, originatingAction: { zone } } ) => {
		data = processZoneData( data );
		if ( ! isArray( state ) ) {
			return state;
		}

		if ( 'number' !== typeof zone.id ) {
			return [
				...state,
				{
					...data,
					methodIds: [],
				},
			];
		}

		const zoneIndex = findIndex( state, { id: zone.id } );
		if ( -1 === zoneIndex ) {
			return state;
		}

		return [
			...state.slice( 0, zoneIndex ),
			{
				...data,
				methodIds: state[ zoneIndex ].methodIds,
			},
			...state.slice( zoneIndex + 1 ),
		];
	},

	[ WOOCOMMERCE_SHIPPING_ZONE_DELETED ]: ( state, { originatingAction: { zone } } ) => {
		if ( ! isArray( state ) ) {
			return state;
		}

		const zoneIndex = findIndex( state, { id: zone.id } );
		if ( -1 === zoneIndex ) {
			return state;
		}

		return [ ...state.slice( 0, zoneIndex ), ...state.slice( zoneIndex + 1 ) ];
	},

	[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_UPDATED ]: (
		state,
		{ data, originatingAction: { zoneId } }
	) => {
		if ( ! isArray( state ) ) {
			return state;
		}

		const zoneIndex = findIndex( state, { id: zoneId } );
		if ( -1 === zoneIndex ) {
			return state;
		}

		if ( -1 !== state[ zoneIndex ].methodIds.indexOf( data.id ) ) {
			return state;
		}

		return [
			...state.slice( 0, zoneIndex ),
			{
				...state[ zoneIndex ],
				methodIds: [ ...state[ zoneIndex ].methodIds, data.id ],
			},
			...state.slice( zoneIndex + 1 ),
		];
	},

	[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_DELETED ]: (
		state,
		{ originatingAction: { zoneId, methodId } }
	) => {
		if ( ! isArray( state ) ) {
			return state;
		}

		const zoneIndex = findIndex( state, { id: zoneId } );
		if ( -1 === zoneIndex ) {
			return state;
		}

		const methodIndex = state[ zoneIndex ].methodIds.indexOf( methodId );
		if ( -1 === methodIndex ) {
			return state;
		}

		return [
			...state.slice( 0, zoneIndex ),
			{
				...state[ zoneIndex ],
				methodIds: [
					...state[ zoneIndex ].methodIds.slice( 0, methodIndex ),
					...state[ zoneIndex ].methodIds.slice( methodIndex + 1 ),
				],
			},
			...state.slice( zoneIndex + 1 ),
		];
	},

	[ WOOCOMMERCE_SHIPPING_ZONES_REQUEST ]: () => {
		return LOADING;
	},

	[ WOOCOMMERCE_SHIPPING_ZONES_REQUEST_SUCCESS ]: ( state, { data } ) => {
		return data.map( processZoneData );
	},
} );
