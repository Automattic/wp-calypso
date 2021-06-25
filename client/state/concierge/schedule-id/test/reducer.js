/**
 * Internal dependencies
 */
import { scheduleId } from '../reducer';
import { CONCIERGE_INITIAL_REQUEST, CONCIERGE_INITIAL_UPDATE } from 'calypso/state/action-types';

describe( 'concierge/scheduleId/reducer', () => {
	test( 'should be defaulted as null.', () => {
		expect( scheduleId( undefined, {} ) ).toBeNull();
	} );

	test( 'should be null on receiving the request action.', () => {
		expect(
			scheduleId( 123, {
				type: CONCIERGE_INITIAL_REQUEST,
			} )
		).toBeNull();
	} );

	test( 'should be the received data on receiving the update action.', () => {
		const expectedScheduleId = 999;

		expect(
			scheduleId( undefined, {
				type: CONCIERGE_INITIAL_UPDATE,
				initial: {
					scheduleId: expectedScheduleId,
				},
			} )
		).toEqual( expectedScheduleId );
	} );
} );
