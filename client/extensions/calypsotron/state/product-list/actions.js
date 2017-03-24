/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { registerActionTypes } from '../../../utils/actions-registry';

const registered = registerActionTypes( 'S9N_PRODUCT_LIST', [
	'INIT_EDITS',
	'CANCEL_EDITS',
	'SAVING_EDITS',
	'EDITS_SAVED',
	'ADD_PRODUCT',
	'EDIT_PRODUCT',
	'DELETE_PRODUCT',
	'SET_DISPLAY_OPTION',
] );

export const TYPES = registered.types;
const ACTIONS = registered.actions;

export function initEdits() {
	return ACTIONS.INIT_EDITS();
}

export function cancelEdits() {
	return ACTIONS.CANCEL_EDITS();
}

export function saveEdits( edits ) {
	return ACTIONS.SAVING_EDITS( edits );
}

export function addProduct() {
	return ACTIONS.ADD_PRODUCT();
}

export function editProduct( id, key, value ) {
	return ACTIONS.EDIT_PRODUCT( { id, key, value } );
}

export function deleteProduct( id ) {
	return ACTIONS.DELETE_PRODUCT( id );
}

export function setDisplayOption( option, value ) {
	return ACTIONS.SET_DISPLAY_OPTION( { option, value } );
}

