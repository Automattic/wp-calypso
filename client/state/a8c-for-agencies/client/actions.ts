import { translate } from 'i18n-calypso';
// Required for modular state.
import 'calypso/state/a8c-for-agencies/init';
import { errorNotice } from 'calypso/state/notices/actions';
import { NoticeActionOptions } from 'calypso/state/notices/types';
import {
	A4A_GET_CLIENT_ERROR,
	A4A_GET_CLIENT_REQUEST,
	A4A_GET_CLIENT_SUCCESS,
} from './action-types';
import { isFetchingClient } from './selectors';
import type { APIError, Client, AgencyThunkAction } from '../types';

export function fetchClient( {
	agencyId,
	clientId,
}: {
	agencyId: string;
	clientId: string;
} ): AgencyThunkAction {
	return ( dispatch, getState ) => {
		if ( isFetchingClient( getState() ) ) {
			return;
		}
		dispatch( {
			type: A4A_GET_CLIENT_REQUEST,
			agencyId,
			clientId,
		} );
	};
}

export function receiveClient( client: Client ): AgencyThunkAction {
	return ( dispatch ) => {
		dispatch( {
			type: A4A_GET_CLIENT_SUCCESS,
			client,
		} );
	};
}

export function receiveClientError( error: APIError ) {
	return (
		dispatch: ( action: {
			type: string;
			error?: { status: number; code: string; message: string };
			notice?: NoticeActionOptions;
		} ) => void
	) => {
		dispatch( {
			type: A4A_GET_CLIENT_ERROR,
			error: {
				status: error.status,
				code: error.code || '',
				message: error.message,
			},
		} );
		dispatch( errorNotice( translate( 'We were unable to retrieve your client details.' ) ) );
	};
}
