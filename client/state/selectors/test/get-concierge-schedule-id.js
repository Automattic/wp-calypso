/**
 * Internal dependencies
 */
import getConciergeScheduleId from 'calypso/state/selectors/get-concierge-schedule-id';

describe( 'getConciergeScheduleId()', () => {
	test( 'should default to null', () => {
		expect( getConciergeScheduleId( {} ) ).toBeNull();
	} );

	test( 'should return the schedule id state value,', () => {
		const scheduleId = 123;

		expect(
			getConciergeScheduleId( {
				concierge: {
					scheduleId,
				},
			} )
		).toEqual( scheduleId );
	} );
} );
