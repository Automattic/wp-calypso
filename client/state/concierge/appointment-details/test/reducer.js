/**
 * Internal dependencies
 */
import { appointmentDetails } from '../reducer';
import {
	CONCIERGE_APPOINTMENT_DETAILS_REQUEST,
	CONCIERGE_APPOINTMENT_DETAILS_UPDATE,
} from 'calypso/state/action-types';

describe( 'concierge/availableTimes/reducer', () => {
	const mockAppointmentDetails = { id: 1, begin_timestamp: 2, end_timestamp: 3 };

	const requestAction = {
		type: CONCIERGE_APPOINTMENT_DETAILS_REQUEST,
	};

	const updateAction = {
		type: CONCIERGE_APPOINTMENT_DETAILS_UPDATE,
		appointmentDetails: mockAppointmentDetails,
	};

	describe( 'appointmentDetails', () => {
		test( 'should be defaulted as null.', () => {
			expect( appointmentDetails( undefined, {} ) ).toBeNull();
		} );

		test( 'should be null on receiving the request action.', () => {
			const state = mockAppointmentDetails;
			expect( appointmentDetails( state, requestAction ) ).toBeNull();
		} );

		test( 'should be the received data on receiving the update action.', () => {
			const state = [];
			expect( appointmentDetails( state, updateAction ) ).toEqual( mockAppointmentDetails );
		} );
	} );
} );
