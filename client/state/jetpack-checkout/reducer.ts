import {
	JETPACK_CHECKOUT_UPDATE_SUPPORT_TICKET_RECEIVE,
	JETPACK_CHECKOUT_UPDATE_SUPPORT_TICKET_REQUEST,
	JETPACK_CHECKOUT_UPDATE_SUPPORT_TICKET_REQUEST_FAILURE,
	JETPACK_CHECKOUT_UPDATE_SUPPORT_TICKET_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { combineReducers, keyedReducer } from 'calypso/state/utils';
import type { Action } from 'redux';

export const requestStatus = keyedReducer( 'receiptId', ( state, { type } ) => {
	switch ( type ) {
		case JETPACK_CHECKOUT_UPDATE_SUPPORT_TICKET_REQUEST:
			return 'pending';

		case JETPACK_CHECKOUT_UPDATE_SUPPORT_TICKET_REQUEST_SUCCESS:
			return 'success';

		case JETPACK_CHECKOUT_UPDATE_SUPPORT_TICKET_REQUEST_FAILURE:
			return 'failed';
	}

	return state;
} );

interface SubmittedSiteUrlAction extends Action {
	payload?: string;
}

export const submittedSiteUrl = keyedReducer< string | undefined, SubmittedSiteUrlAction >(
	'jetpackTemporarySiteId',
	( state, { type, payload }: SubmittedSiteUrlAction ) => {
		switch ( type ) {
			case JETPACK_CHECKOUT_UPDATE_SUPPORT_TICKET_RECEIVE:
				return payload;
		}

		return state;
	}
);

export default combineReducers( {
	requestStatus,
	submittedSiteUrl,
} );
