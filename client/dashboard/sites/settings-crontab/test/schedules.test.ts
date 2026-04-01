import { parseSchedule } from '../schedules';

describe( 'parseSchedule', () => {
	describe( 'predefined schedules', () => {
		test( 'parses "hourly"', () => {
			expect( parseSchedule( 'hourly' ) ).toEqual( {
				scheduleType: 'hourly',
				customNumber: 1,
				customFrequency: 'h',
			} );
		} );

		test( 'parses "twicedaily"', () => {
			expect( parseSchedule( 'twicedaily' ) ).toEqual( {
				scheduleType: 'twicedaily',
				customNumber: 1,
				customFrequency: 'h',
			} );
		} );

		test( 'parses "daily"', () => {
			expect( parseSchedule( 'daily' ) ).toEqual( {
				scheduleType: 'daily',
				customNumber: 1,
				customFrequency: 'h',
			} );
		} );

		test( 'parses "weekly"', () => {
			expect( parseSchedule( 'weekly' ) ).toEqual( {
				scheduleType: 'weekly',
				customNumber: 1,
				customFrequency: 'h',
			} );
		} );
	} );

	describe( 'shorthand notation', () => {
		test( 'parses hour-based shorthand "2h"', () => {
			expect( parseSchedule( '2h' ) ).toEqual( {
				scheduleType: 'custom',
				customNumber: 2,
				customFrequency: 'h',
			} );
		} );

		test( 'parses day-based shorthand "6d"', () => {
			expect( parseSchedule( '6d' ) ).toEqual( {
				scheduleType: 'custom',
				customNumber: 6,
				customFrequency: 'd',
			} );
		} );

		test( 'parses week-based shorthand "3w"', () => {
			expect( parseSchedule( '3w' ) ).toEqual( {
				scheduleType: 'custom',
				customNumber: 3,
				customFrequency: 'w',
			} );
		} );

		test( 'parses single-digit shorthand "1d"', () => {
			expect( parseSchedule( '1d' ) ).toEqual( {
				scheduleType: 'custom',
				customNumber: 1,
				customFrequency: 'd',
			} );
		} );

		test( 'parses multi-digit shorthand "12h"', () => {
			expect( parseSchedule( '12h' ) ).toEqual( {
				scheduleType: 'custom',
				customNumber: 12,
				customFrequency: 'h',
			} );
		} );
	} );

	describe( 'unrecognized values default to custom hourly', () => {
		test( 'defaults for a raw cron expression', () => {
			expect( parseSchedule( '0 * * * *' ) ).toEqual( {
				scheduleType: 'custom',
				customNumber: 1,
				customFrequency: 'h',
			} );
		} );

		test( 'defaults for an arbitrary string', () => {
			expect( parseSchedule( 'something' ) ).toEqual( {
				scheduleType: 'custom',
				customNumber: 1,
				customFrequency: 'h',
			} );
		} );

		test( 'defaults for an empty string', () => {
			expect( parseSchedule( '' ) ).toEqual( {
				scheduleType: 'custom',
				customNumber: 1,
				customFrequency: 'h',
			} );
		} );

		test( 'does not match shorthand with invalid frequency letter', () => {
			expect( parseSchedule( '5x' ) ).toEqual( {
				scheduleType: 'custom',
				customNumber: 1,
				customFrequency: 'h',
			} );
		} );

		test( 'does not match shorthand without a number', () => {
			expect( parseSchedule( 'h' ) ).toEqual( {
				scheduleType: 'custom',
				customNumber: 1,
				customFrequency: 'h',
			} );
		} );
	} );
} );
