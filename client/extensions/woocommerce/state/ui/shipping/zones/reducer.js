/**
 * External dependencies
 */
import { isEmpty, isEqual, reject } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_SHIPPING_ZONE_ADD,
	WOOCOMMERCE_SHIPPING_ZONE_CANCEL,
	WOOCOMMERCE_SHIPPING_ZONE_CLOSE,
	WOOCOMMERCE_SHIPPING_ZONE_EDIT_NAME,
	WOOCOMMERCE_SHIPPING_ZONE_OPEN,
	WOOCOMMERCE_SHIPPING_ZONE_REMOVE,
} from '../../../action-types';
import { nextBucketIndex, getBucket } from '../../helpers';

const initialState = {
	creates: [],
	updates: [],
	deletes: [],
	currentlyEditingId: null,
};

const reducer = {};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_ADD ] = ( state ) => {
	const id = nextBucketIndex( state.creates );
	return reducer[ WOOCOMMERCE_SHIPPING_ZONE_OPEN ]( state, { payload: { id } } );
};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_CANCEL ] = ( state ) => {
	return reducer[ WOOCOMMERCE_SHIPPING_ZONE_CLOSE ]( { ...state,
		currentlyEditingChanges: {},
	} );
};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_CLOSE ] = ( state ) => {
	const { currentlyEditingChanges, currentlyEditingId } = state;
	if ( null === currentlyEditingId || isEmpty( currentlyEditingChanges ) ) {
		return state;
	}

	const bucket = getBucket( currentlyEditingId );
	let found = false;
	const newBucket = state[ bucket ].map( zone => {
		if ( isEqual( currentlyEditingId, zone.id ) ) {
			found = true;
			return { ...zone, ...currentlyEditingChanges };
		}
		return zone;
	} );

	if ( ! found ) {
		newBucket.push( { id: currentlyEditingId, ...currentlyEditingChanges } );
	}

	return { ...state,
		currentlyEditingId: null,
		[ bucket ]: newBucket,
	};
};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_EDIT_NAME ] = ( state, { payload: { name } } ) => {
	if ( null === state.currentlyEditingId ) {
		return state;
	}
	return { ...state,
		currentlyEditingChanges: { ...state.currentlyEditingChanges,
			name,
		},
	};
};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_OPEN ] = ( state, { payload: { id } } ) => {
	return { ...state,
		currentlyEditingId: id,
		currentlyEditingChanges: {},
	};
};

reducer[ WOOCOMMERCE_SHIPPING_ZONE_REMOVE ] = ( state, { payload: { id } } ) => {
	const newState = { ...state,
		currentlyEditingId: null,
	};

	const bucket = getBucket( id );
	if ( 'updates' === bucket ) {
		newState.deletes = [ ...state.deletes, { id } ];
	}
	newState[ bucket ] = reject( state[ bucket ], { id } );

	return newState;
};

export default createReducer( initialState, reducer );
