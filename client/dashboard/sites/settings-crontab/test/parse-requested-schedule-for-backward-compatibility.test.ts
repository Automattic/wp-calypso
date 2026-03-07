import { parseRequestedScheduleForBackwardCompatibility } from '../parse-requested-schedule-for-backward-compatibility';

describe( 'parseRequestedScheduleForBackwardCompatibility', () => {
	describe( 'predefined schedule names', () => {
		test( 'returns "hourly" as-is', () => {
			expect( parseRequestedScheduleForBackwardCompatibility( 'hourly' ) ).toBe( 'hourly' );
		} );

		test( 'returns "twicedaily" as-is', () => {
			expect( parseRequestedScheduleForBackwardCompatibility( 'twicedaily' ) ).toBe( 'twicedaily' );
		} );

		test( 'returns "daily" as-is', () => {
			expect( parseRequestedScheduleForBackwardCompatibility( 'daily' ) ).toBe( 'daily' );
		} );

		test( 'returns "weekly" as-is', () => {
			expect( parseRequestedScheduleForBackwardCompatibility( 'weekly' ) ).toBe( 'weekly' );
		} );
	} );

	describe( 'shorthand notation', () => {
		test( 'passes through hour-based shorthand like "2h"', () => {
			expect( parseRequestedScheduleForBackwardCompatibility( '2h' ) ).toBe( '2h' );
		} );

		test( 'passes through day-based shorthand like "5d"', () => {
			expect( parseRequestedScheduleForBackwardCompatibility( '5d' ) ).toBe( '5d' );
		} );

		test( 'passes through week-based shorthand like "3w"', () => {
			expect( parseRequestedScheduleForBackwardCompatibility( '3w' ) ).toBe( '3w' );
		} );

		test( 'passes through single-digit shorthand like "1h"', () => {
			expect( parseRequestedScheduleForBackwardCompatibility( '1h' ) ).toBe( '1h' );
		} );

		test( 'passes through multi-digit shorthand like "12d"', () => {
			expect( parseRequestedScheduleForBackwardCompatibility( '12d' ) ).toBe( '12d' );
		} );
	} );

	describe( 'raw cron expressions — hourly', () => {
		test( 'detects "0 * * * *" as hourly', () => {
			expect( parseRequestedScheduleForBackwardCompatibility( '0 * * * *' ) ).toBe( 'hourly' );
		} );

		test( 'detects "30 * * * *" as hourly', () => {
			expect( parseRequestedScheduleForBackwardCompatibility( '30 * * * *' ) ).toBe( 'hourly' );
		} );

		test( 'detects "59 * * * *" as hourly', () => {
			expect( parseRequestedScheduleForBackwardCompatibility( '59 * * * *' ) ).toBe( 'hourly' );
		} );
	} );

	describe( 'raw cron expressions — twice daily', () => {
		test( 'detects "0 6,18 * * *" as twicedaily', () => {
			expect( parseRequestedScheduleForBackwardCompatibility( '0 6,18 * * *' ) ).toBe(
				'twicedaily'
			);
		} );

		test( 'detects "30 0,12 * * *" as twicedaily', () => {
			expect( parseRequestedScheduleForBackwardCompatibility( '30 0,12 * * *' ) ).toBe(
				'twicedaily'
			);
		} );
	} );

	describe( 'raw cron expressions — daily', () => {
		test( 'detects "0 0 * * *" as daily', () => {
			expect( parseRequestedScheduleForBackwardCompatibility( '0 0 * * *' ) ).toBe( 'daily' );
		} );

		test( 'detects "45 10 * * *" as daily', () => {
			expect( parseRequestedScheduleForBackwardCompatibility( '45 10 * * *' ) ).toBe( 'daily' );
		} );

		test( 'detects "0 23 * * *" as daily', () => {
			expect( parseRequestedScheduleForBackwardCompatibility( '0 23 * * *' ) ).toBe( 'daily' );
		} );
	} );

	describe( 'raw cron expressions — weekly', () => {
		test( 'detects "0 0 * * 0" as weekly', () => {
			expect( parseRequestedScheduleForBackwardCompatibility( '0 0 * * 0' ) ).toBe( 'weekly' );
		} );

		test( 'detects "30 14 * * 5" as weekly', () => {
			expect( parseRequestedScheduleForBackwardCompatibility( '30 14 * * 5' ) ).toBe( 'weekly' );
		} );

		test( 'detects "0 9 * * 1" as weekly', () => {
			expect( parseRequestedScheduleForBackwardCompatibility( '0 9 * * 1' ) ).toBe( 'weekly' );
		} );
	} );

	describe( 'unrecognized values default to hourly', () => {
		test( 'returns hourly for non-standard cron with specific day-of-month', () => {
			expect( parseRequestedScheduleForBackwardCompatibility( '0 0 15 * *' ) ).toBe( 'hourly' );
		} );

		test( 'returns hourly for non-standard cron with specific month', () => {
			expect( parseRequestedScheduleForBackwardCompatibility( '0 0 * 6 *' ) ).toBe( 'hourly' );
		} );

		test( 'returns hourly for arbitrary strings', () => {
			expect( parseRequestedScheduleForBackwardCompatibility( 'something' ) ).toBe( 'hourly' );
		} );

		test( 'returns hourly for empty string', () => {
			expect( parseRequestedScheduleForBackwardCompatibility( '' ) ).toBe( 'hourly' );
		} );

		test( 'returns hourly for undefined', () => {
			expect(
				parseRequestedScheduleForBackwardCompatibility( undefined as unknown as string )
			).toBe( 'hourly' );
		} );

		test( 'returns hourly for malformed cron with too few parts', () => {
			expect( parseRequestedScheduleForBackwardCompatibility( '0 *' ) ).toBe( 'hourly' );
		} );

		test( 'returns hourly for malformed cron with too many parts', () => {
			expect( parseRequestedScheduleForBackwardCompatibility( '0 * * * * *' ) ).toBe( 'hourly' );
		} );
	} );
} );
