/**
 * @jest-environment jsdom
 */
import { formatLabel } from '../utils';

describe( 'formatLabel', () => {
	const locale = 'en-US';

	test( 'normalizes with IANA timezone (no off-by-one)', () => {
		const tz = 'Europe/London';
		const start = new Date( 2025, 7, 19 );
		const end = new Date( 2025, 7, 25 );
		const label = formatLabel( start, end, locale, tz, undefined );
		expect( label ).toBe( 'Aug 19, 2025 to Aug 25, 2025' );
	} );

	test( 'normalizes with offset-only UTC+0 (empty timezoneString)', () => {
		const start = new Date( 2025, 7, 19 );
		const end = new Date( 2025, 7, 25 );
		const label = formatLabel( start, end, locale, undefined, 0 );
		expect( label ).toBe( 'Aug 19, 2025 to Aug 25, 2025' );
	} );

	test( 'normalizes with negative offset (e.g., -5)', () => {
		const start = new Date( 2025, 0, 1 );
		const end = new Date( 2025, 0, 2 );
		const label = formatLabel( start, end, locale, undefined, -5 );
		expect( label ).toBe( 'Jan 1, 2025 to Jan 2, 2025' );
	} );

	describe( 'DST boundaries (America/New_York)', () => {
		const tz = 'America/New_York';

		test( 'spring-forward does not shift calendar days', () => {
			// 2025-03-09 is the DST start date in US (clocks jump forward)
			const start = new Date( 2025, 2, 8, 12 ); // Mar 8 @ 12:00 UTC
			const end = new Date( 2025, 2, 10, 12 ); // Mar 10 @ 12:00 UTC
			const label = formatLabel( start, end, locale, tz, undefined );
			expect( label ).toBe( 'Mar 8, 2025 to Mar 10, 2025' );
		} );

		test( 'fall-back does not shift calendar days', () => {
			// 2025-11-02 is the DST end date in US (clocks fall back)
			const start = new Date( 2025, 10, 1, 12 ); // Nov 1 @ 12:00 UTC
			const end = new Date( 2025, 10, 3, 12 ); // Nov 3 @ 12:00 UTC
			const label = formatLabel( start, end, locale, tz, undefined );
			expect( label ).toBe( 'Nov 1, 2025 to Nov 3, 2025' );
		} );
	} );
} );
