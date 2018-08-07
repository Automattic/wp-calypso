/** @format */

/**
 * Internal dependencies
 */
import getConciergeNextAppointmentSite from 'state/selectors/get-concierge-next-appointment-site';

describe( 'getConciergeNextAppointmentSite()', () => {
	test( 'should be defaulted to null.', () => {
		expect( getConciergeNextAppointmentSite( {} ) ).toBeNull();
	} );

	test( 'should return the next appointments site under the concierge shift state tree.', () => {
		const siteInfo = { id: '12345', siteUrl: 'https://wordpress.com', blogName: 'WordPress' };
		const state = {
			concierge: {
				nextAppointment: {
					siteInfo: siteInfo,
				},
			},
		};

		expect( getConciergeNextAppointmentSite( state ) ).toEqual( siteInfo );
	} );
} );
