/**
 * External dependencies
 */
import { find, findIndex, isNil, reject } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_REMOVE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_CHANGE_TYPE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_EDIT_TITLE,
} from 'woocommerce/state/action-types';
import { nextBucketIndex, getBucket } from 'woocommerce/state/ui/helpers';
import flatRate from './flat-rate/reducer';
import freeShipping from './free-shipping/reducer';
import localPickup from './local-pickup/reducer';

export const builtInShippingMethods = {
	flat_rate: flatRate,
	free_shipping: freeShipping,
	local_pickup: localPickup,
};

export const initialState = {
	creates: [],
	updates: [],
	deletes: [],
};

const reducer = {};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD ] = ( state, action ) => {
	const method_id = action.payload.method_id;
	const id = nextBucketIndex( state.creates );
	let method = { id, method_id };
	if ( builtInShippingMethods[ method_id ] ) {
		method = { ...method, ...builtInShippingMethods[ method_id ]( undefined, action ) };
	}
	return { ...state,
		creates: [ ...state.creates, method ],
	};
};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_REMOVE ] = ( state, { payload: { id } } ) => {
	const newState = { ...state };

	const bucket = getBucket( { id } );
	if ( 'updates' === bucket ) {
		newState.deletes = [ ...state.deletes, { id } ];
	}
	newState[ bucket ] = reject( state[ bucket ], { id } );

	return newState;
};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_CHANGE_TYPE ] = ( state, action ) => {
	const bucket = getBucket( { id: action.payload.id } );
	const method = find( state[ bucket ], { id: action.payload.id } );
	let originalId = action.payload.id;
	if ( method && ! isNil( method._originalId ) ) {
		originalId = method._originalId;
	}

	state = reducer[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_REMOVE ]( state, action );
	state = reducer[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD ]( state, action );
	state.creates[ state.creates.length - 1 ]._originalId = originalId;
	return state;
};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_EDIT_TITLE ] = ( state, { payload: { id, title } } ) => {
	const bucket = getBucket( { id } );
	const index = findIndex( state[ bucket ], { id } );
	if ( -1 === index ) {
		return state;
	}
	const methodState = { ...state[ bucket ][ index ],
		title,
	};
	return { ...state,
		[ bucket ]: [
			...state[ bucket ].slice( 0, index ),
			methodState,
			...state[ bucket ].slice( index + 1 ),
		],
	};
};

const mainReducer = createReducer( initialState, reducer );

export default ( state, action ) => {
	const newState = mainReducer( state, action );

	const payload = action.payload || {};
	const id = payload.id;
	const methodId = payload.method_id;
	if ( id && methodId && builtInShippingMethods[ methodId ] ) {
		const bucket = getBucket( { id } );
		const index = findIndex( newState[ bucket ], { id } );
		if ( -1 !== index ) {
			const methodState = newState[ bucket ][ index ];
			const newMethodState = builtInShippingMethods[ methodId ]( methodState, action );
			if ( newMethodState !== methodState ) {
				return { ...newState,
					[ bucket ]: [
						...newState[ bucket ].slice( 0, index ),
						newMethodState,
						...newState[ bucket ].slice( index + 1 ),
					],
				};
			}
		}
	}

	return newState;
};
