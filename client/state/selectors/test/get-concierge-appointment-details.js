/** @format */

/**
 * Internal dependencies
 */
import { getConciergeAppointmentDetails } from 'state/selectors';

describe( 'getConciergeAppointmentDetails()', () => {
	test( 'should be defaulted to null.', () => {
		expect( getConciergeAppointmentDetails( {} ) ).toBeNull();
	} );

	test( 'should return the appointment details field under the concierge state tree.', () => {
		const appointmentDetails = { id: 1, beginTimestamp: 2 };
		const state = {
			concierge: {
				appointmentDetails,
			},
		};

		expect( getConciergeAppointmentDetails( state ) ).toEqual( appointmentDetails );
	} );
} );
