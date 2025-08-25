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
} );
