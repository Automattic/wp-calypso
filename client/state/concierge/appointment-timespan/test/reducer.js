/**
 * Internal dependencies
 */
import { appointmentTimespan } from '../reducer';
import { CONCIERGE_INITIAL_REQUEST, CONCIERGE_INITIAL_UPDATE } from 'calypso/state/action-types';

describe( 'concierge/appointmentTimespan/reducer', () => {
	test( 'should be defaulted as null.', () => {
		expect( appointmentTimespan( undefined, {} ) ).toBeNull();
	} );

	test( 'should be null on receiving the request action.', () => {
		expect(
			appointmentTimespan( 123, {
				type: CONCIERGE_INITIAL_REQUEST,
			} )
		).toBeNull();
	} );

	test( 'should be the received data on receiving the update action.', () => {
		const expectedAppointmentTimespan = 1984;

		expect(
			appointmentTimespan( undefined, {
				type: CONCIERGE_INITIAL_UPDATE,
				initial: {
					appointmentTimespan: expectedAppointmentTimespan,
				},
			} )
		).toEqual( expectedAppointmentTimespan );
	} );
} );
