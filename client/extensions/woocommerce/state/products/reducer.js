/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { WOOCOMMERCE_EDIT_PRODUCT } from '../action-types';

export const initialState = {
	add: {
		id: null,
		variationTypes: [ {
			type: '',
			values: [],
		} ],
	},
};

export function edits( state = initialState, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_EDIT_PRODUCT:
			return editProduct( state, action );
		default:
			return state;
	}
}

export function editProduct( state, action ) {
	const { id, key, value } = action.payload;
	const add = state.add || {};

	if ( ! id ) {
		const newAdd = Object.assign( {}, add, { [ key ]: value } );
		return Object.assign( {}, state, { add: newAdd } );
	}

	/// @Todo Logic for existing products (in addition to new product above).
	return state;
}

export default combineReducers( {
	edits,
} );
