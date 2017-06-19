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
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_TOGGLE_ENABLED,
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
	const methodType = action.methodType;
	const id = nextBucketIndex( state.creates );
	let method = { id, methodType, enabled: true };
	if ( builtInShippingMethods[ methodType ] ) {
		method = { ...method, ...builtInShippingMethods[ methodType ]( undefined, action ) };
	}
	return { ...state,
		creates: [ ...state.creates, method ],
	};
};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_REMOVE ] = ( state, { methodId } ) => {
	const newState = { ...state };

	const bucket = getBucket( { id: methodId } );
	if ( 'updates' === bucket ) {
		newState.deletes = [ ...state.deletes, { id: methodId } ];
	}
	newState[ bucket ] = reject( state[ bucket ], { id: methodId } );

	return newState;
};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_CHANGE_TYPE ] = ( state, action ) => {
	const bucket = getBucket( { id: action.methodId } );
	const method = find( state[ bucket ], { id: action.methodId } );
	let originalId = action.methodId;
	if ( method && ! isNil( method._originalId ) ) {
		originalId = method._originalId;
	}

	state = reducer[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_REMOVE ]( state, action );
	state = reducer[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD ]( state, action );
	state.creates[ state.creates.length - 1 ]._originalId = originalId;
	return state;
};

const editMethodSetting = ( state, methodId, setting, value ) => {
	const bucket = getBucket( { id: methodId } );
	const index = findIndex( state[ bucket ], { id: methodId } );

	if ( -1 === index ) {
		return { ...state,
			[ bucket ]: [
				...state[ bucket ],
				{
					id: methodId,
					[ setting ]: value,
				},
			],
		};
	}

	const methodState = { ...state[ bucket ][ index ],
		[ setting ]: value,
	};
	return { ...state,
		[ bucket ]: [
			...state[ bucket ].slice( 0, index ),
			methodState,
			...state[ bucket ].slice( index + 1 ),
		],
	};
};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_EDIT_TITLE ] = ( state, { methodId, title } ) => {
	return editMethodSetting( state, methodId, 'title', title );
};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_TOGGLE_ENABLED ] = ( state, { methodId, enabled } ) => {
	return editMethodSetting( state, methodId, 'enabled', Boolean( enabled ) );
};

const mainReducer = createReducer( initialState, reducer );

export default ( state, action ) => {
	if ( reducer[ action.type ] ) {
		return mainReducer( state, action );
	}

	const { methodId, methodType } = action;
	// If the action has something to do with a built-in shipping method, fire its reducer
	if ( methodId && methodType && builtInShippingMethods[ methodType ] ) {
		const bucket = getBucket( { id: methodId } );
		const index = findIndex( state[ bucket ], { id: methodId } );

		// Only give the shipping method reducer data about the shipping method itself, not the whole tree
		const methodState = -1 !== index ? state[ bucket ][ index ] : { id: methodId };
		const newMethodState = builtInShippingMethods[ methodType ]( methodState, action );

		if ( -1 === index ) {
			return { ...state,
				[ bucket ]: [ ...state[ bucket ], newMethodState ]
			};
		}

		if ( newMethodState !== methodState ) {
			return { ...state,
				[ bucket ]: [
					...state[ bucket ].slice( 0, index ),
					newMethodState,
					...state[ bucket ].slice( index + 1 ),
				],
			};
		}
	}

	return state;
};
