/** @format */

/**
 * Internal dependencies
 */
import getConciergeNextAppointment from 'state/selectors/get-concierge-next-appointment';

describe( 'getConciergeNextAppointment()', () => {
	test( 'should be defaulted to null.', () => {
		expect( getConciergeNextAppointment( {} ) ).toBeNull();
	} );

	test( 'should return the next appointment under the concierge shift state tree.', () => {
		const nextAppointment = { beginTimestamp: 1, endTimestamp: 2, scheduleId: 3 };
		const state = {
			concierge: {
				nextAppointment,
			},
		};

		expect( getConciergeNextAppointment( state ) ).toEqual( nextAppointment );
	} );
} );
