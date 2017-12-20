/** @format */

/**
 * Internal dependencies
 */
import bookForm, { timestamp, status } from '../reducer';
import { CONCIERGE_SELECT_TIME_SLOT, CONCIERGE_UPDATE_BOOKING_STATUS } from 'state/action-types';

describe( 'concierge/bookForm/reducer', () => {
	const mockDay = new Date( '2017-01-01 08:00:00' );
	const mockTimestamp = 1234567890;
	const mockStatus = 'booking';

	const updateTimeslot = {
		type: CONCIERGE_SELECT_TIME_SLOT,
		day: mockDay,
		timestamp: mockTimestamp,
	};

	const updateStatus = {
		type: CONCIERGE_UPDATE_BOOKING_STATUS,
		status: mockStatus,
	};

	describe( 'timestamp', () => {
		test( 'should be defaulted as null.', () => {
			expect( timestamp( undefined, {} ) ).toBeNull();
		} );

		test( 'should return the timestamp of the update action', () => {
			expect( timestamp( {}, updateTimeslot ) ).toEqual( mockTimestamp );
		} );
	} );

	describe( 'status', () => {
		test( 'should be defaulted as null.', () => {
			expect( status( undefined, {} ) ).toBeNull();
		} );

		test( 'should return the status of the update action', () => {
			expect( status( {}, updateStatus ) ).toEqual( mockStatus );
		} );
	} );

	describe( 'bookForm', () => {
		test( 'should combine all defaults as null.', () => {
			expect( bookForm( undefined, {} ) ).toEqual( { selectedTimeSlots: {}, status: null } );
		} );

		test( 'should return the proper status of the update action', () => {
			const expectedFields = { selectedTimeSlots: {}, status: mockStatus };
			expect( bookForm( {}, updateStatus ) ).toEqual( expectedFields );
		} );

		test( 'should return the proper timeslots', () => {
			const expectedFields = {
				selectedTimeSlots: { [ mockDay ]: mockTimestamp },
				status: null,
			};
			expect( bookForm( {}, updateTimeslot ) ).toEqual( expectedFields );
		} );

		test( 'should not overwrite status when updating timeslots', () => {
			const expectedFields = {
				selectedTimeSlots: { [ mockDay ]: mockTimestamp },
				status: 'test',
			};
			expect( bookForm( { status: 'test' }, updateTimeslot ) ).toEqual( expectedFields );
		} );
	} );
} );
