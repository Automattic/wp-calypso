/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_ORDER_NOTE_CREATE,
	WOOCOMMERCE_ORDER_NOTE_CREATE_SUCCESS,
	WOOCOMMERCE_ORDER_NOTE_CREATE_FAILURE,
	WOOCOMMERCE_ORDER_NOTES_REQUEST,
	WOOCOMMERCE_ORDER_NOTES_REQUEST_FAILURE,
	WOOCOMMERCE_ORDER_NOTES_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

export const createNote = ( siteId, orderId, note, onSuccess = false, onFailure = false ) => {
	return {
		type: WOOCOMMERCE_ORDER_NOTE_CREATE,
		siteId,
		orderId,
		note,
		onSuccess,
		onFailure,
	};
};

export const createNoteFailure = ( siteId, orderId, error = {} ) => {
	return {
		type: WOOCOMMERCE_ORDER_NOTE_CREATE_FAILURE,
		siteId,
		orderId,
		error,
	};
};

export const createNoteSuccess = ( siteId, orderId, note ) => {
	return {
		type: WOOCOMMERCE_ORDER_NOTE_CREATE_SUCCESS,
		siteId,
		orderId,
		note,
	};
};

export const fetchNotes = ( siteId, orderId, onSuccess = false, onFailure = false ) => {
	return {
		type: WOOCOMMERCE_ORDER_NOTES_REQUEST,
		siteId,
		orderId,
		onSuccess,
		onFailure,
	};
};

export const fetchNotesFailure = ( siteId, orderId, error = {} ) => {
	return {
		type: WOOCOMMERCE_ORDER_NOTES_REQUEST_FAILURE,
		siteId,
		orderId,
		error,
	};
};

export const fetchNotesSuccess = ( siteId, orderId, notes ) => {
	return {
		type: WOOCOMMERCE_ORDER_NOTES_REQUEST_SUCCESS,
		siteId,
		orderId,
		notes,
	};
};
