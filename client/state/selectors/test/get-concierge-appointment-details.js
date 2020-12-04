/**
 * Internal dependencies
 */
import getConciergeAppointmentDetails from 'calypso/state/selectors/get-concierge-appointment-details';

describe( 'getConciergeAppointmentDetails()', () => {
	test( 'should be defaulted to null.', () => {
		expect( getConciergeAppointmentDetails( {}, 1 ) ).toBeNull();
	} );

	test( 'should return the appointment details field under the concierge state tree.', () => {
		const appointmentDetails = { id: 1, beginTimestamp: 2 };
		const state = {
			concierge: {
				appointmentDetails: {
					[ appointmentDetails.id ]: appointmentDetails,
				},
			},
		};

		expect( getConciergeAppointmentDetails( state, appointmentDetails.id ) ).toEqual(
			appointmentDetails
		);
	} );
} );
