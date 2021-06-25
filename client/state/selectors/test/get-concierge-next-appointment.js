/**
 * Internal dependencies
 */
import getConciergeNextAppointment from 'calypso/state/selectors/get-concierge-next-appointment';

describe( 'getConciergeNextAppointment()', () => {
	test( 'should default to null', () => {
		expect( getConciergeNextAppointment( {} ) ).toBeNull();
	} );

	test( 'should return the stored next appointment field.', () => {
		const nextAppointment = {
			beginTimestamp: 123,
			endTimestamp: 999,
			id: 1,
			meta: {},
			scheduleId: 123,
		};

		expect(
			getConciergeNextAppointment( {
				concierge: {
					nextAppointment,
				},
			} )
		).toEqual( nextAppointment );
	} );
} );
