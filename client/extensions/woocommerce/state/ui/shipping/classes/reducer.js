/** @format */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_SHIPPING_CLASS_ADD,
	WOOCOMMERCE_SHIPPING_CLASS_DELETE,
	WOOCOMMERCE_SHIPPING_CLASS_EDIT,
	WOOCOMMERCE_SHIPPING_CLASS_UPDATE,
	WOOCOMMERCE_SHIPPING_CLASS_CLOSE,
	WOOCOMMERCE_SHIPPING_CLASS_DELETED,
	WOOCOMMERCE_SHIPPING_CLASS_UPDATED,
	WOOCOMMERCE_SHIPPING_CLASS_CHANGE,
	WOOCOMMERCE_SHIPPING_CLASS_CREATE,
	WOOCOMMERCE_SHIPPING_CLASS_CREATED,
} from 'woocommerce/state/action-types';

export const initialState = {
	editing: false,
	classId: null,
	changes: {},
	saving: [],
	creating: [],
	deleting: [],
};

const reducer = {};

reducer[ WOOCOMMERCE_SHIPPING_CLASS_ADD ] = state => {
	return {
		...state,
		editing: true,
		classId: null,
		changes: {},
	};
};

reducer[ WOOCOMMERCE_SHIPPING_CLASS_EDIT ] = ( state, { classId } ) => {
	return {
		...state,
		classId,
		editing: true,
		changes: {},
	};
};

reducer[ WOOCOMMERCE_SHIPPING_CLASS_CLOSE ] = state => {
	return {
		...state,
		editing: false,
		classId: null,
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

reducer[ WOOCOMMERCE_SHIPPING_CLASS_DELETE ] = state => {
	return {
		...state,
		editing: false,
		classId: null,
		changes: {},
	};
};

reducer[ WOOCOMMERCE_SHIPPING_CLASS_UPDATE ] = ( state, { id } ) => {
	return {
		...state,
		editing: false,
		classId: null,
		changes: {},
		saving: [ ...state.saving, id ],
	};
};

reducer[ WOOCOMMERCE_SHIPPING_CLASS_UPDATED ] = ( state, { data: { id } } ) => {
	return {
		...state,
		saving: state.saving.filter( item => item !== id ),
	};
};

reducer[ WOOCOMMERCE_SHIPPING_CLASS_CREATE ] = ( state, { temporaryId, data } ) => {
	return {
		...state,
		editing: false,
		changes: {},
		saving: [ ...state.saving, temporaryId ],
		creating: [
			...state.creating,
			{
				...data,
				id: temporaryId,
			},
		],
	};
};

reducer[ WOOCOMMERCE_SHIPPING_CLASS_CREATED ] = ( state, { temporaryId } ) => {
	return {
		...state,
		saving: state.saving.filter( item => item !== temporaryId ),
		creating: state.creating.filter( item => item.id !== temporaryId ),
	};
};

reducer[ WOOCOMMERCE_SHIPPING_CLASS_DELETE ] = ( state, { classId } ) => {
	return {
		...state,
		deleting: [ ...state.deleting, classId ],
		editing: false,
		changes: {},
	};
};

reducer[ WOOCOMMERCE_SHIPPING_CLASS_DELETED ] = ( state, { classId } ) => {
	return {
		...state,
		deleting: state.deleting.filter( item => item !== classId ),
	};
};

export default createReducer( initialState, reducer );
