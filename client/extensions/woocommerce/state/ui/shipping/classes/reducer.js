/** @format */

/**
 * External dependencies
 */

import { isEmpty } from 'lodash';
import impureLodash from 'lib/impure-lodash';
const { uniqueId } = impureLodash;

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_SHIPPING_CLASS_ADD,
	WOOCOMMERCE_SHIPPING_CLASS_REMOVE,
	WOOCOMMERCE_SHIPPING_CLASS_EDIT,
	WOOCOMMERCE_SHIPPING_CLASS_CLOSE,
	WOOCOMMERCE_SHIPPING_CLASS_CHANGE,
	WOOCOMMERCE_SHIPPING_CLASS_SAVE,
	WOOCOMMERCE_SHIPPING_CLASS_UPDATED,
	WOOCOMMERCE_SHIPPING_CLASS_CREATED,
	WOOCOMMERCE_SHIPPING_CLASS_DELETED,
} from 'woocommerce/state/action-types';

export const initialState = {
	editing: false,
	editingClass: null,
	changes: {},
	created: [],
	deleted: [],
	updates: [],
};

const updateShippingClass = state => {
	const { updates, editingClass: id, changes } = state;

	if ( isEmpty( changes ) ) {
		return {
			...state,
			editing: false,
			editingClass: null,
		};
	}

	return {
		...state,
		editing: false,
		changes: {},
		updates: [ ...updates, { id, ...changes } ],
	};
};

const reducer = {};

reducer[ WOOCOMMERCE_SHIPPING_CLASS_ADD ] = state => {
	return {
		...state,
		editing: true,
		editingClass: null,
		changes: {},
	};
};

reducer[ WOOCOMMERCE_SHIPPING_CLASS_EDIT ] = ( state, { classId } ) => {
	return {
		...state,
		editingClass: classId,
		editing: true,
		changes: {},
	};
};

reducer[ WOOCOMMERCE_SHIPPING_CLASS_CLOSE ] = state => {
	return {
		...state,
		editing: false,
		editingClass: null,
		changes: {},
	};
};

reducer[ WOOCOMMERCE_SHIPPING_CLASS_CHANGE ] = ( state, { field, value } ) => {
	return {
		...state,
		changes: {
			...state.changes,
			[ field ]: value,
		},
	};
};

reducer[ WOOCOMMERCE_SHIPPING_CLASS_SAVE ] = state => {
	const { editingClass: id } = state;

	// If the class already exists in some form, just use the standard reducer
	if ( id ) {
		return updateShippingClass( state );
	}

	const temporaryId = uniqueId( 'temp-' );

	return updateShippingClass( {
		...state,
		created: [ ...state.created, temporaryId ],
		editingClass: temporaryId,
	} );
};

reducer[ WOOCOMMERCE_SHIPPING_CLASS_REMOVE ] = ( state, { classId } ) => {
	return {
		...state,
		deleted: [ ...state.deleted, classId ],
		editing: false,
		changes: {},
	};
};

reducer[ WOOCOMMERCE_SHIPPING_CLASS_UPDATED ] = ( state, { data: { id } } ) => {
	return {
		...state,
		updates: state.updates.filter( changeset => changeset.id !== id ),
	};
};

reducer[ WOOCOMMERCE_SHIPPING_CLASS_CREATED ] = ( state, { temporaryId } ) => {
	return {
		...state,
		updates: state.updates.filter( changeset => temporaryId !== changeset.id ),
		created: state.created.filter( classId => temporaryId !== classId ),
	};
};

reducer[ WOOCOMMERCE_SHIPPING_CLASS_DELETED ] = ( state, { classId } ) => {
	return {
		...state,
		deleted: state.deleted.filter( id => id !== classId ),
		created: state.created.filter( id => id !== classId ),
		updates: state.updates.filter( changeset => changeset.id !== classId ),
	};
};

export default createReducer( initialState, reducer );
