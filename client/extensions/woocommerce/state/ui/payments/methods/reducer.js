/**
 * External dependencies
 */
import { isEmpty, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_PAYMENT_METHOD_CANCEL,
	WOOCOMMERCE_PAYMENT_METHOD_CLOSE,
	WOOCOMMERCE_PAYMENT_METHOD_EDIT_FIELD,
	WOOCOMMERCE_PAYMENT_METHOD_OPEN,
} from '../../../action-types';
import { getBucket } from '../../helpers';

export const initialState = {
	creates: [],
	updates: [],
	deletes: [],
	currentlyEditingId: null,
};

function paymentMethodCancelAction( state ) {
	// "Canceling" editing a method is equivalent at "closing" it without any changes
	return paymentMethodCloseAction( { ...state,
		currentlyEditingChanges: {},
	} );
}

function paymentMethodCloseAction( state ) {
	const { currentlyEditingChanges, currentlyEditingId } = state;
	if ( null === currentlyEditingId ) {
		return state;
	}
	if ( isEmpty( currentlyEditingChanges ) ) {
		// Nothing to save, no need to go through the rest of the algorithm
		return { ...state,
			currentlyEditingId: null,
		};
	}
	const bucket = getBucket( { id: currentlyEditingId } );
	let found = false;
	const newBucket = state[ bucket ].map( method => {
		if ( isEqual( currentlyEditingId, method.id ) ) {
			found = true;
			// If edits for the method were already in the expected bucket, just update them
			return { ...method, ...currentlyEditingChanges };
		}
		return method;
	} );

	if ( ! found ) {
		// If edits for the method were *not* in the bucket yet, add them
		newBucket.push( { id: currentlyEditingId, ...currentlyEditingChanges } );
	}

	return { ...state,
		currentlyEditingId: null,
		[ bucket ]: newBucket,
	};
}

function paymentMethodEditFieldAction( state, { field, value } ) {
	if ( null === state.currentlyEditingId ) {
		return state;
	}
	return { ...state,
		currentlyEditingChanges: { ...state.currentlyEditingChanges,
			[ field ]: { value },
		},
	};
}

function paymentMethodOpenAction( state, { id } ) {
	return { ...state,
		currentlyEditingId: id,
		currentlyEditingChanges: {}, // Always reset the current changes
	};
}

export default createReducer( initialState, {
	[ WOOCOMMERCE_PAYMENT_METHOD_CANCEL ]: paymentMethodCancelAction,
	[ WOOCOMMERCE_PAYMENT_METHOD_CLOSE ]: paymentMethodCloseAction,
	[ WOOCOMMERCE_PAYMENT_METHOD_EDIT_FIELD ]: paymentMethodEditFieldAction,
	[ WOOCOMMERCE_PAYMENT_METHOD_OPEN ]: paymentMethodOpenAction,
} );
