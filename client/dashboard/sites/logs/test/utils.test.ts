/**
 * @jest-environment jsdom
 */
import { buildTimeRangeInSeconds } from '../utils';

describe( 'buildTimeRangeInSeconds', () => {
	// Fixed local date components; the function reads getFullYear/getMonth/getDate,
	// so these assertions are independent of the test runner's timezone.
	const start = new Date( 2026, 6, 3 ); // Jul 3, 2026 (local midnight)
	const end = new Date( 2026, 6, 3 );

	describe( 'site UTC offset branch', () => {
		it( 'defaults to the full day (backward-compatibility guard)', () => {
			const { startSec, endSec } = buildTimeRangeInSeconds( start, end, undefined, 0 );
			expect( startSec ).toBe( Math.floor( Date.UTC( 2026, 6, 3, 0, 0, 0 ) / 1000 ) );
			expect( endSec ).toBe( Math.floor( Date.UTC( 2026, 6, 3, 23, 59, 59 ) / 1000 ) );
			expect( endSec - startSec ).toBe( 86399 );
		} );

		it( 'applies a custom window: start at :00, end inclusive to :59', () => {
			const { startSec, endSec } = buildTimeRangeInSeconds(
				start,
				end,
				undefined,
				0,
				'09:30',
				'17:00'
			);
			expect( startSec ).toBe( Math.floor( Date.UTC( 2026, 6, 3, 9, 30, 0 ) / 1000 ) );
			expect( endSec ).toBe( Math.floor( Date.UTC( 2026, 6, 3, 17, 0, 59 ) / 1000 ) );
		} );

		it( 'accounts for a positive site UTC offset', () => {
			const { startSec, endSec } = buildTimeRangeInSeconds(
				start,
				end,
				undefined,
				2,
				'09:00',
				'10:00'
			);
			expect( startSec ).toBe(
				Math.floor( ( Date.UTC( 2026, 6, 3, 9, 0, 0 ) - 2 * 3_600_000 ) / 1000 )
			);
			expect( endSec ).toBe(
				Math.floor( ( Date.UTC( 2026, 6, 3, 10, 0, 59 ) - 2 * 3_600_000 ) / 1000 )
			);
		} );

		it( 'clamps malformed times to safe bounds', () => {
			const { startSec, endSec } = buildTimeRangeInSeconds(
				start,
				end,
				undefined,
				0,
				'99:99',
				'oops'
			);
			// start hour clamps to 23, minute to 59; unparsable end falls back to 00:00 -> :59
			expect( startSec ).toBe( Math.floor( Date.UTC( 2026, 6, 3, 23, 59, 0 ) / 1000 ) );
			expect( endSec ).toBe( Math.floor( Date.UTC( 2026, 6, 3, 0, 0, 59 ) / 1000 ) );
		} );
	} );

	describe( 'named timezone branch (span assertions, timezone-data independent)', () => {
		it( 'default spans a full day', () => {
			const { startSec, endSec } = buildTimeRangeInSeconds( start, end, 'UTC' );
			expect( endSec - startSec ).toBe( 86399 );
		} );

		it( 'custom times narrow the span to the requested window', () => {
			const { startSec, endSec } = buildTimeRangeInSeconds(
				start,
				end,
				'UTC',
				undefined,
				'09:00',
				'17:00'
			);
			// 09:00:00 -> 17:00:59 = 8h + 59s
			expect( endSec - startSec ).toBe( 8 * 3600 + 59 );
		} );
	} );
} );
