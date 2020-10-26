/**
 * Internal dependencies
 */
import { nextAppointment } from '../reducer';
import { CONCIERGE_INITIAL_REQUEST, CONCIERGE_INITIAL_UPDATE } from 'calypso/state/action-types';

describe( 'concierge/nextAppointment/reducer', () => {
	const mockAppointmentDetails = {
		nextAppointment: {
			id: 1,
			begin_timestamp: 2,
			end_timestamp: 3,
		},
	};

	const requestAction = {
		type: CONCIERGE_INITIAL_REQUEST,
	};

	const updateAction = {
		type: CONCIERGE_INITIAL_UPDATE,
		initial: mockAppointmentDetails,
	};

	describe( 'nextAppointment', () => {
		test( 'should default to null.', () => {
			expect( nextAppointment( undefined, {} ) ).toBeNull();
		} );

		test( 'should be null on receiving the request action.', () => {
			const state = mockAppointmentDetails;
			expect( nextAppointment( state, requestAction ) ).toBeNull();
		} );

		test( 'should be the next appointment data on receiving the update action.', () => {
			const state = [];
			expect( nextAppointment( state, updateAction ) ).toEqual(
				mockAppointmentDetails.nextAppointment
			);
		} );
	} );
} );
