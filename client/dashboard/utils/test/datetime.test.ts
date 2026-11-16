import { dateI18n } from '@wordpress/date';
import MockDate from 'mockdate';
import {
	parseYmdLocal,
	formatYmd,
	formatSiteYmd,
	getCalendarDaysUntil,
	getRelativeTimeString,
	getRelativeDayString,
} from '../datetime';

describe( 'datetime utils (site-time)', () => {
	describe( 'parseYmdLocal', () => {
		test( 'parses valid YYYY-MM-DD to a local Date at midnight', () => {
			const d = parseYmdLocal( '2025-08-13' )!;
			expect( d ).toBeInstanceOf( Date );
			expect( d.getFullYear() ).toBe( 2025 );
			expect( d.getMonth() ).toBe( 7 );
			expect( d.getDate() ).toBe( 13 );
			expect( d.getHours() ).toBe( 0 );
			expect( d.getMinutes() ).toBe( 0 );
		} );

		test.each( [ '2025-13-01', '2025-02-30', '2025-8-1', 'abc' ] )(
			'rejects invalid or malformed dates: %s',
			( s ) => {
				expect( parseYmdLocal( s ) ).toBeNull();
			}
		);

		test( 'accepts leap-day only when valid', () => {
			expect( parseYmdLocal( '2024-02-29' ) ).not.toBeNull();
			expect( parseYmdLocal( '2025-02-29' ) ).toBeNull();
		} );
	} );

	describe( 'formatYmd', () => {
		test( 'uses timezoneString when provided', () => {
			const tz = 'Pacific/Auckland';
			const date = new Date( 2025, 7, 13 );
			expect( formatYmd( date, tz ) ).toBe( dateI18n( 'Y-m-d', date, tz ) );
		} );

		test( 'falls back to gmtOffset when tz is missing', () => {
			const date = new Date( 2025, 7, 13 );
			expect( formatYmd( date, undefined, 12 ) ).toMatch( /^\d{4}-\d{2}-\d{2}$/ );
		} );

		test( 'falls back to browser local when neither tz nor offset provided', () => {
			const date = new Date( 2025, 7, 13 );
			expect( formatYmd( date ) ).toBe( dateI18n( 'Y-m-d', date ) );
		} );

		// Optional DST boundary
		test( 'stays on the same calendar day across DST boundaries (tz path)', () => {
			const tz = 'Europe/London';
			const date = new Date( 2025, 2, 30 );
			expect( formatYmd( date, tz ) ).toBe( dateI18n( 'Y-m-d', date, tz ) );
		} );

		test( 'respects positive offsets across UTC boundary', () => {
			expect( formatYmd( new Date( '2025-09-22T00:30:00Z' ), undefined, 14 ) ).toBe( '2025-09-22' );
			expect( formatYmd( new Date( '2025-09-22T23:30:00Z' ), undefined, 14 ) ).toBe( '2025-09-23' );
		} );

		test( 'respects negative offsets across UTC boundary', () => {
			expect( formatYmd( new Date( '2025-09-22T00:30:00Z' ), undefined, -12 ) ).toBe(
				'2025-09-21'
			);
			expect( formatYmd( new Date( '2025-09-22T23:30:00Z' ), undefined, -12 ) ).toBe(
				'2025-09-22'
			);
		} );
	} );

	describe( 'formatSiteYmd', () => {
		test( 'formatSiteYmd returns the calendar day as-is (no tz math)', () => {
			expect( formatSiteYmd( new Date( 2025, 8, 22 ) ) ).toBe( '2025-09-22' );
		} );
		test( 'preserves the calendar day regardless of time of day', () => {
			expect( formatSiteYmd( new Date( 2025, 8, 22, 0, 0 ) ) ).toBe( '2025-09-22' );
			expect( formatSiteYmd( new Date( 2025, 8, 22, 23, 59 ) ) ).toBe( '2025-09-22' );
		} );

		test( 'produces the same string after parsing with parseYmdLocal', () => {
			const d = new Date( 2025, 8, 22 );
			const ymd = formatSiteYmd( d );
			expect( formatSiteYmd( parseYmdLocal( ymd )! ) ).toBe( ymd );
		} );
		test( 'handles month/year boundaries correctly', () => {
			expect( formatSiteYmd( new Date( 2025, 11, 31 ) ) ).toBe( '2025-12-31' ); // Dec 31
			expect( formatSiteYmd( new Date( 2026, 0, 1 ) ) ).toBe( '2026-01-01' ); // Jan 1
		} );
	} );

	describe( 'getCalendarDaysUntil', () => {
		beforeEach( () => {
			MockDate.set( '2026-02-24T12:00:00Z' );
		} );

		afterEach( () => {
			MockDate.reset();
		} );

		test( 'counts calendar days, not elapsed 24-hour periods', () => {
			// Less than 24 hours away, but on tomorrow's calendar day.
			expect( getCalendarDaysUntil( new Date( '2026-02-25T01:00:00Z' ) ) ).toBe( 1 );
			// More than 24 hours away, but only two calendar days out.
			expect( getCalendarDaysUntil( new Date( '2026-02-26T01:00:00Z' ) ) ).toBe( 2 );
		} );

		test( 'returns 0 for any time on today’s calendar day', () => {
			expect( getCalendarDaysUntil( new Date( '2026-02-24T00:00:00Z' ) ) ).toBe( 0 );
			expect( getCalendarDaysUntil( new Date( '2026-02-24T23:59:59Z' ) ) ).toBe( 0 );
		} );

		test( 'returns negative values for past days', () => {
			expect( getCalendarDaysUntil( new Date( '2026-02-23T23:00:00Z' ) ) ).toBe( -1 );
			expect( getCalendarDaysUntil( new Date( '2026-02-14T12:00:00Z' ) ) ).toBe( -10 );
		} );

		test( 'crosses month boundaries', () => {
			expect( getCalendarDaysUntil( new Date( '2026-03-01T12:00:00Z' ) ) ).toBe( 5 );
		} );
	} );

	describe( 'getRelativeTimeString', () => {
		beforeEach( () => {
			MockDate.set( '2026-02-24T12:00:00Z' );
		} );

		afterEach( () => {
			MockDate.reset();
		} );

		test( 'describes upcoming dates in days', () => {
			expect( getRelativeTimeString( new Date( '2026-02-25T12:00:00Z' ) ) ).toBe( 'in 1 day' );
			expect( getRelativeTimeString( new Date( '2026-02-27T12:00:00Z' ) ) ).toBe( 'in 3 days' );
		} );

		test( 'describes past dates in days', () => {
			expect( getRelativeTimeString( new Date( '2026-02-21T12:00:00Z' ) ) ).toBe( '3 days ago' );
		} );

		test( 'counts whole calendar months rather than rounding to the nearest', () => {
			// A day short of a full month still reads in days.
			expect( getRelativeTimeString( new Date( '2026-03-23T12:00:00Z' ) ) ).toBe( 'in 27 days' );
			expect( getRelativeTimeString( new Date( '2026-03-24T12:00:00Z' ) ) ).toBe( 'in 1 month' );
			// Well past one month but short of two.
			expect( getRelativeTimeString( new Date( '2026-04-10T12:00:00Z' ) ) ).toBe( 'in 1 month' );
		} );

		test( 'falls back to hours within the same calendar day', () => {
			expect( getRelativeTimeString( new Date( '2026-02-24T19:00:00Z' ) ) ).toBe( 'in 7 hours' );
		} );
	} );

	describe( 'getRelativeDayString', () => {
		beforeEach( () => {
			MockDate.set( '2026-02-24T12:00:00Z' );
		} );

		afterEach( () => {
			MockDate.reset();
		} );

		test( 'never drops below day granularity', () => {
			expect( getRelativeDayString( new Date( '2026-02-24T19:00:00Z' ), 'upcoming' ) ).toBe(
				'today'
			);
			expect( getRelativeDayString( new Date( '2026-02-24T01:00:00Z' ), 'past' ) ).toBe( 'today' );
		} );

		test( 'clamps an upcoming date that has already slipped past', () => {
			// An expiry date the backend has not yet flagged as expired must not
			// read as "1 day ago" inside a future-tense sentence.
			expect( getRelativeDayString( new Date( '2026-02-23T12:00:00Z' ), 'upcoming' ) ).toBe(
				'today'
			);
		} );

		test( 'clamps a past date that is still in the future', () => {
			// A purchase removed before its expiry date must not read as "in 3 days"
			// inside a past-tense sentence.
			expect( getRelativeDayString( new Date( '2026-02-27T12:00:00Z' ), 'past' ) ).toBe( 'today' );
		} );

		test( 'passes through dates that point the expected way', () => {
			expect( getRelativeDayString( new Date( '2026-02-27T12:00:00Z' ), 'upcoming' ) ).toBe(
				'in 3 days'
			);
			expect( getRelativeDayString( new Date( '2026-02-21T12:00:00Z' ), 'past' ) ).toBe(
				'3 days ago'
			);
		} );
	} );
} );
