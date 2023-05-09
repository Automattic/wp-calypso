import {
	CONCIERGE_APPOINTMENT_DETAILS_REQUEST,
	CONCIERGE_APPOINTMENT_DETAILS_UPDATE,
} from 'calypso/state/action-types';
import { keyedReducer } from 'calypso/state/utils';

export const appointmentDetails = ( state = null, action ) => {
	switch ( action.type ) {
		case CONCIERGE_APPOINTMENT_DETAILS_REQUEST:
			return null;
		case CONCIERGE_APPOINTMENT_DETAILS_UPDATE:
			return action.appointmentDetails;
	}

	return state;
};

export default keyedReducer( 'appointmentId', appointmentDetails );
