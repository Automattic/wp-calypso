/** @format */

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import request from 'woocommerce/state/sites/request';
import {
	WOOCOMMERCE_ORDER_NOTE_CREATE,
	WOOCOMMERCE_ORDER_NOTE_CREATE_SUCCESS,
	WOOCOMMERCE_ORDER_NOTE_CREATE_FAILURE,
	WOOCOMMERCE_ORDER_NOTES_REQUEST,
	WOOCOMMERCE_ORDER_NOTES_REQUEST_FAILURE,
	WOOCOMMERCE_ORDER_NOTES_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

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

export const createNoteSuccess = ( siteId, orderId, note ) => {
	return {
		type: WOOCOMMERCE_ORDER_NOTE_CREATE_SUCCESS,
		siteId,
		orderId,
		note,
	};
};

export const createNote = ( siteId, orderId, note ) => ( dispatch, getState ) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}

	dispatch( {
		type: WOOCOMMERCE_ORDER_NOTE_CREATE,
		siteId,
		orderId,
	} );

	return request( siteId )
		.post( `orders/${ orderId }/notes`, note )
		.then( data => {
			// If note is customer note, maybe add a notice
			// dispatch( successNotice( translate( 'Notified customer.' ), { duration: 5000 } ) );
			dispatch( createNoteSuccess( siteId, orderId, data ) );
		} )
		.catch( error => {
			dispatch( {
				type: WOOCOMMERCE_ORDER_NOTE_CREATE_FAILURE,
				siteId,
				orderId,
				error,
			} );
		} );
};
