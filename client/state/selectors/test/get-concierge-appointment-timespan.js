/**
 * Internal dependencies
 */
import getConciergeAppointmentTimespan from 'calypso/state/selectors/get-concierge-appointment-timespan';

describe( 'getConciergeAppointmentTimespan()', () => {
	test( 'should default to null', () => {
		expect( getConciergeAppointmentTimespan( {} ) ).toBeNull();
	} );

	test( 'should return the appointment timespan state value,', () => {
		const appointmentTimespan = 987;

		expect(
			getConciergeAppointmentTimespan( {
				concierge: {
					appointmentTimespan,
				},
			} )
		).toEqual( appointmentTimespan );
	} );
} );
