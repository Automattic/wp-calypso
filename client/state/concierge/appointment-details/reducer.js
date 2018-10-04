/** @format */

/**
 * Internal dependencies
 */
import { createReducer, keyedReducer } from 'state/utils';
import {
	CONCIERGE_APPOINTMENT_DETAILS_REQUEST,
	CONCIERGE_APPOINTMENT_DETAILS_UPDATE,
} from 'state/action-types';

export const appointmentDetails = createReducer( null, {
	[ CONCIERGE_APPOINTMENT_DETAILS_REQUEST ]: () => null,
	[ CONCIERGE_APPOINTMENT_DETAILS_UPDATE ]: ( state, action ) => action.appointmentDetails,
} );

export default keyedReducer( 'appointmentId', appointmentDetails );
