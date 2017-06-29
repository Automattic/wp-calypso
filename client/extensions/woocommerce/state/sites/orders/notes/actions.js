/**
 * Internal dependencies
 */
import { areOrderNotesLoaded, areOrderNotesLoading } from './selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import request from '../../request';
import {
	WOOCOMMERCE_ORDER_NOTES_REQUEST,
	WOOCOMMERCE_ORDER_NOTES_REQUEST_FAILURE,
	WOOCOMMERCE_ORDER_NOTES_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

export const fetchNotes = ( siteId, orderId ) => ( dispatch, getState ) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}
	if ( areOrderNotesLoaded( state, orderId, siteId ) || areOrderNotesLoading( state, orderId, siteId ) ) {
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
