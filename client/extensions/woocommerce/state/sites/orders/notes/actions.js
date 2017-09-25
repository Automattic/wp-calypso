/**
 * Internal dependencies
 */
import request from '../../request';
import { areOrderNotesLoaded, areOrderNotesLoading } from './selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { WOOCOMMERCE_ORDER_NOTE_CREATE, WOOCOMMERCE_ORDER_NOTE_CREATE_SUCCESS, WOOCOMMERCE_ORDER_NOTE_CREATE_FAILURE, WOOCOMMERCE_ORDER_NOTES_REQUEST, WOOCOMMERCE_ORDER_NOTES_REQUEST_FAILURE, WOOCOMMERCE_ORDER_NOTES_REQUEST_SUCCESS } from 'woocommerce/state/action-types';

export const fetchNotes = ( siteId, orderId, refresh = false ) => ( dispatch, getState ) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}
	if ( areOrderNotesLoading( state, orderId, siteId ) ) {
		return;
	}
	// Bail if the order notes are loaded, and we don't want to force a refresh
	if ( ! refresh && areOrderNotesLoaded( state, orderId, siteId ) ) {
		return;
	}

	dispatch( {
		type: WOOCOMMERCE_ORDER_NOTES_REQUEST,
		siteId,
		orderId,
	} );

	return request( siteId ).get( `orders/${ orderId }/notes` ).then( data => {
		dispatch( {
			type: WOOCOMMERCE_ORDER_NOTES_REQUEST_SUCCESS,
			siteId,
			orderId,
			notes: data,
		} );
	} ).catch( error => {
		dispatch( {
			type: WOOCOMMERCE_ORDER_NOTES_REQUEST_FAILURE,
			siteId,
			orderId,
			error,
		} );
	} );
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

	return request( siteId ).post( `orders/${ orderId }/notes`, note ).then( data => {
		// If note is customer note, maybe add a notice
		// dispatch( successNotice( translate( 'Notified customer.' ), { duration: 5000 } ) );
		dispatch( {
			type: WOOCOMMERCE_ORDER_NOTE_CREATE_SUCCESS,
			siteId,
			orderId,
			note: data,
		} );
	} ).catch( error => {
		dispatch( {
			type: WOOCOMMERCE_ORDER_NOTE_CREATE_FAILURE,
			siteId,
			orderId,
			error,
		} );
	} );
};
