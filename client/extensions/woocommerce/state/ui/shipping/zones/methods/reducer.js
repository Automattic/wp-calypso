/**
 * External dependencies
 */
import { find, isEmpty, isEqual, isNil, reject } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_OPEN,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_CANCEL,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_CLOSE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_REMOVE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_CHANGE_TYPE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_EDIT_TITLE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_TOGGLE_ENABLED,
} from 'woocommerce/state/action-types';
import { nextBucketIndex, getBucket } from 'woocommerce/state/ui/helpers';
import flatRate from './flat-rate/reducer';
import freeShipping from './free-shipping/reducer';
import localPickup from './local-pickup/reducer';
import { getMethodName } from './utils';

export const builtInShippingMethods = {
	flat_rate: flatRate,
	free_shipping: freeShipping,
	local_pickup: localPickup,
};

export const initialState = {
	creates: [],
	updates: [],
	deletes: [],
	currentlyEditingId: null,
};

const reducer = {};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD ] = ( state, action ) => {
	const methodType = action.methodType;
	const id = nextBucketIndex( state.creates );
	let method = { id, methodType, enabled: true };
	if ( builtInShippingMethods[ methodType ] ) {
		method = {
			...method,
			...builtInShippingMethods[ methodType ]( undefined, action ),
			title: getMethodName( methodType ),
		};
	}
	return { ...state,
		creates: [ ...state.creates, method ],
	};
};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_OPEN ] = ( state, action ) => {
	return { ...state,
		currentlyEditingId: action.methodId,
		currentlyEditingChanges: {},
	};
};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_CANCEL ] = ( state ) => {
	return { ...state,
		currentlyEditingId: null,
	};
};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_CLOSE ] = ( state ) => {
	const { currentlyEditingId, currentlyEditingChanges } = state;

	if ( null === currentlyEditingId ) {
		return state;
	}
	if ( isEmpty( currentlyEditingChanges ) ) {
		// Nothing to save, no need to go through the rest of the algorithm
		return { ...state,
			currentlyEditingId: null,
		};
	}

	const { changedType } = currentlyEditingChanges;
	const bucket = getBucket( { id: currentlyEditingId } );

	//if method type has been changed, then remove the old one and a new method in its place
	if ( changedType ) {
		const method = find( state[ bucket ], { id: currentlyEditingId } );
		let originalId = currentlyEditingId;
		if ( method && ! isNil( method._originalId ) ) {
			originalId = method._originalId;
		}

		state = reducer[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_REMOVE ]( state, { methodId: currentlyEditingId } );
		return { ...state,
			currentlyEditingId: null,
			creates: [
				...state.creates,
				{
					...currentlyEditingChanges,
					id: nextBucketIndex( state.creates ),
					_originalId: originalId
				}
			],
		};
	}

	let found = false;
	const newBucket = state[ bucket ].map( method => {
		if ( isEqual( currentlyEditingId, method.id ) ) {
			found = true;
			// If edits for the method were already in the expected bucket, just update them
			return {
				...method,
				...currentlyEditingChanges,
			};
		}
		return method;
	} );

	if ( ! found ) {
		// If edits for the zone were *not* in the bucket yet, add them
		newBucket.push( { id: currentlyEditingId, ...currentlyEditingChanges } );
	}

	return { ...state,
		currentlyEditingId: null,
		[ bucket ]: newBucket,
	};
};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_REMOVE ] = ( state, { methodId } ) => {
	const newState = {
		...state,
		currentlyEditingId: null,
	};

	const bucket = getBucket( { id: methodId } );
	if ( 'updates' === bucket ) {
		newState.deletes = [ ...state.deletes, { id: methodId } ];
	}
	newState[ bucket ] = reject( state[ bucket ], { id: methodId } );

	return newState;
};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_CHANGE_TYPE ] = ( state, action ) => {
	const { methodType } = action;
	if ( ! builtInShippingMethods[ methodType ] ) {
		return state;
	}

	const currentlyEditingChanges = {
		...builtInShippingMethods[ methodType ]( undefined, action ),
		id: state.currentlyEditingId,
		title: getMethodName( methodType ),
		changedType: true,
		methodType
	};

	return { ...state, currentlyEditingChanges };
};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_EDIT_TITLE ] = ( state, { title } ) => {
	return { ...state,
		currentlyEditingChanges: { ...state.currentlyEditingChanges,
			title,
		}
	};
};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_METHOD_TOGGLE_ENABLED ] = ( state, { enabled } ) => {
	return { ...state,
		currentlyEditingChanges: { ...state.currentlyEditingChanges,
			enabled,
		}
	};
};

const mainReducer = createReducer( initialState, reducer );

export default ( state, action ) => {
	if ( reducer[ action.type ] ) {
		return mainReducer( state, action );
	}

	const { methodId, methodType } = action;
	// If the action has something to do with a built-in shipping method, fire its reducer
	if ( methodId && methodType && builtInShippingMethods[ methodType ] ) {
		// Only give the shipping method reducer data about the shipping method itself, not the whole tree
		const methodState = state.currentlyEditingChanges;
		const newMethodState = builtInShippingMethods[ methodType ]( methodState, action );

		if ( newMethodState !== methodState ) {
			return { ...state,
				currentlyEditingChanges: newMethodState,
			};
		}
	}

	return state;
};
