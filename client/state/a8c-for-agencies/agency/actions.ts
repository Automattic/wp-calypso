import config from '@automattic/calypso-config';
import { translate } from 'i18n-calypso';
// Required for modular state.
import 'calypso/state/a8c-for-agencies/init';
import { errorNotice } from 'calypso/state/notices/actions';
import { NoticeActionOptions } from 'calypso/state/notices/types';
import { APIError, Agency, AgencyThunkAction } from '../types';
import {
	JETPACK_GET_AGENCIES_ERROR,
	JETPACK_GET_AGENCIES_REQUEST,
	JETPACK_GET_AGENCIES_SUCCESS,
	JETPACK_CURRENT_AGENCY_UPDATE,
	JETPACK_SET_AGENCY_CLIENT_USER,
} from './action-types';
import { getActiveAgency, isFetchingAgency } from './selectors';

export function setActiveAgency( agency: Agency ): AgencyThunkAction {
	return ( dispatch, getState ) => {
		if ( ! agency || isFetchingAgency( getState() ) ) {
			return;
		}
		dispatch( { type: JETPACK_CURRENT_AGENCY_UPDATE, activeAgency: agency } );
	};
}

export function fetchAgencies(): AgencyThunkAction {
	return ( dispatch, getState ) => {
		if ( isFetchingAgency( getState() ) ) {
			return;
		}

		dispatch( {
			type: JETPACK_GET_AGENCIES_REQUEST,
		} );
	};
}

export function receiveAgencies( agencies: Agency[] ): AgencyThunkAction {
	return ( dispatch, getState ) => {
		dispatch( {
			type: JETPACK_GET_AGENCIES_SUCCESS,
			agencies,
		} );

		const activeAgency = getActiveAgency( getState() );

		let newAgency = agencies[ 0 ]; // Default to the first id until we support multiple agencies.

		const foundActiveAgency = agencies.find( ( agency ) => agency.id === activeAgency?.id );

		if ( foundActiveAgency ) {
			// If the active agency id is for a valid agency, select it.
			newAgency = foundActiveAgency;
		}

		if ( newAgency ) {
			dispatch( setActiveAgency( newAgency ) );

			// Enable the Partner Directory section
			if ( ! config.isEnabled( 'a4a-partner-directory' ) && newAgency.partner_directory.allowed ) {
				config.enable( 'a4a-partner-directory' );
			}
		}
	};
}

export function setAgencyClientUser( isClientUser: boolean ): AgencyThunkAction {
	return ( dispatch ) => {
		dispatch( {
			type: JETPACK_SET_AGENCY_CLIENT_USER,
			isClientUser,
		} );
	};
}

export function receiveAgenciesError( error: APIError ) {
	return (
		dispatch: ( arg0: {
			type: string;
			error?: { status: number; code: string; message: string };
			notice?: NoticeActionOptions;
		} ) => void
	) => {
		dispatch( {
			type: JETPACK_GET_AGENCIES_ERROR,
			error: {
				status: error.status,
				code: error.code || '',
				message: error.message,
			},
		} );
		dispatch( errorNotice( translate( 'We were unable to retrieve your agency details.' ) ) );
	};
}
