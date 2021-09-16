import { CONCIERGE_INITIAL_REQUEST, CONCIERGE_INITIAL_UPDATE } from 'calypso/state/action-types';
import { isUserBlocked } from '../reducer';

describe( 'concierge/isUserBlocked/reducer', () => {
	const mockAppointmentDetails = {
		isUserBlocked: true,
	};

	const requestAction = {
		type: CONCIERGE_INITIAL_REQUEST,
	};

	const updateAction = {
		type: CONCIERGE_INITIAL_UPDATE,
		initial: mockAppointmentDetails,
	};

	describe( 'isUserBlocked', () => {
		test( 'should default to null.', () => {
			expect( isUserBlocked( undefined, {} ) ).toBeNull();
		} );

		test( 'should be null on receiving the request action.', () => {
			const state = mockAppointmentDetails;
			expect( isUserBlocked( state, requestAction ) ).toBeNull();
		} );

		test( 'should be the user blocked status on receiving the update action.', () => {
			const state = [];
			expect( isUserBlocked( state, updateAction ) ).toEqual(
				mockAppointmentDetails.isUserBlocked
			);
		} );
	} );
} );
