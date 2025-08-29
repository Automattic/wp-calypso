/**
 * @jest-environment jsdom
 */
import { formatLabel, computePresetRange, getTimezoneAwareDate, getActivePresetId } from '../utils';

describe( 'formatLabel', () => {
	const locale = 'en-US';

	test( 'formats date range consistently (UTC-based)', () => {
		const start = new Date( 2025, 7, 19 );
		const end = new Date( 2025, 7, 25 );
		const label = formatLabel( start, end, locale );
		expect( label ).toBe( 'Aug 19, 2025 to Aug 25, 2025' );
	} );

	test( 'formats different date ranges correctly', () => {
		const start = new Date( 2025, 0, 1 );
		const end = new Date( 2025, 0, 2 );
		const label = formatLabel( start, end, locale );
		expect( label ).toBe( 'Jan 1, 2025 to Jan 2, 2025' );
	} );

	test( 'formats single day range correctly', () => {
		const start = new Date( 2025, 7, 19 );
		const end = new Date( 2025, 7, 19 );
		const label = formatLabel( start, end, locale );
		expect( label ).toBe( 'Aug 19, 2025 to Aug 19, 2025' );
	} );
} );

describe( 'computePresetRange', () => {
	// Mock date: August 25, 2025
	const baseDate = new Date( 2025, 7, 25 );

	test( 'today preset returns same date', () => {
		const result = computePresetRange( 'today', baseDate );
		expect( result ).toEqual( { from: baseDate, to: baseDate } );
	} );

	test( 'yesterday preset returns previous day', () => {
		const result = computePresetRange( 'yesterday', baseDate );
		// Should be August 24, 2025
		expect( result?.from.getDate() ).toBe( 24 );
		expect( result?.to.getDate() ).toBe( 24 );
		expect( result?.from.getMonth() ).toBe( 7 ); // August
		expect( result?.from.getFullYear() ).toBe( 2025 );
	} );

	test( 'last-7-days preset returns 7-day range', () => {
		const result = computePresetRange( 'last-7-days', baseDate );
		// Should be August 19-25, 2025 (7 days inclusive)
		expect( result?.from.getDate() ).toBe( 19 );
		expect( result?.to.getDate() ).toBe( 25 );
		expect( result?.from.getMonth() ).toBe( 7 ); // August
		expect( result?.from.getFullYear() ).toBe( 2025 );
	} );

	test( 'last-30-days preset returns 30-day range', () => {
		const result = computePresetRange( 'last-30-days', baseDate );
		// Should be July 27 - August 25, 2025 (30 days inclusive)
		expect( result?.from.getMonth() ).toBe( 6 ); // July
		expect( result?.from.getDate() ).toBe( 27 );
		expect( result?.to.getDate() ).toBe( 25 );
		expect( result?.to.getMonth() ).toBe( 7 ); // August
	} );

	test( 'month-to-date preset returns start of month to base date', () => {
		const result = computePresetRange( 'month-to-date', baseDate );
		// Should be August 1 - August 25, 2025
		expect( result?.from.getDate() ).toBe( 1 );
		expect( result?.to.getDate() ).toBe( 25 );
		expect( result?.from.getMonth() ).toBe( 7 ); // August
	} );

	test( 'year-to-date preset returns start of year to base date', () => {
		const result = computePresetRange( 'year-to-date', baseDate );
		// Should be January 1 - August 25, 2025
		expect( result?.from.getDate() ).toBe( 1 );
		expect( result?.from.getMonth() ).toBe( 0 ); // January
		expect( result?.to.getDate() ).toBe( 25 );
		expect( result?.to.getMonth() ).toBe( 7 ); // August
	} );

	test( 'last-12-months preset returns 12-month range', () => {
		const result = computePresetRange( 'last-12-months', baseDate );
		// Should be August 26, 2024 - August 25, 2025
		expect( result?.from.getFullYear() ).toBe( 2024 );
		expect( result?.from.getMonth() ).toBe( 7 ); // August
		expect( result?.from.getDate() ).toBe( 26 );
		expect( result?.to.getFullYear() ).toBe( 2025 );
		expect( result?.to.getMonth() ).toBe( 7 ); // August
		expect( result?.to.getDate() ).toBe( 25 );
	} );

	test( 'last-3-years preset returns 3-year range', () => {
		const result = computePresetRange( 'last-3-years', baseDate );
		// Should be August 26, 2022 - August 25, 2025
		expect( result?.from.getFullYear() ).toBe( 2022 );
		expect( result?.from.getMonth() ).toBe( 7 ); // August
		expect( result?.from.getDate() ).toBe( 26 );
		expect( result?.to.getFullYear() ).toBe( 2025 );
		expect( result?.to.getMonth() ).toBe( 7 ); // August
		expect( result?.to.getDate() ).toBe( 25 );
	} );

	test( 'custom preset returns undefined', () => {
		const result = computePresetRange( 'custom', baseDate );
		expect( result ).toBeUndefined();
	} );
} );

describe( 'getTimezoneAwareDate', () => {
	const baseDate = new Date( 2025, 7, 25, 12, 30, 45 ); // August 25, 2025 12:30:45

	test( 'returns start of day when no timezone info provided', () => {
		const result = getTimezoneAwareDate( baseDate );
		expect( result.getFullYear() ).toBe( 2025 );
		expect( result.getMonth() ).toBe( 7 ); // August
		expect( result.getDate() ).toBe( 25 );
		expect( result.getHours() ).toBe( 0 );
		expect( result.getMinutes() ).toBe( 0 );
		expect( result.getSeconds() ).toBe( 0 );
	} );

	test( 'uses timezone string when available', () => {
		// Mock a timezone that would give different results
		const result = getTimezoneAwareDate( baseDate, 'Pacific/Honolulu' );
		// The exact result depends on the timezone, but it should be normalized to start of day
		expect( result.getHours() ).toBe( 0 );
		expect( result.getMinutes() ).toBe( 0 );
		expect( result.getSeconds() ).toBe( 0 );
	} );

	test( 'uses GMT offset when available', () => {
		const result = getTimezoneAwareDate( baseDate, undefined, 5 ); // UTC+5
		expect( result.getHours() ).toBe( 0 );
		expect( result.getMinutes() ).toBe( 0 );
		expect( result.getSeconds() ).toBe( 0 );
	} );

	test( 'prioritizes timezone string over GMT offset', () => {
		const result = getTimezoneAwareDate( baseDate, 'Pacific/Honolulu', 5 );
		// Should use timezone string, not GMT offset
		expect( result.getHours() ).toBe( 0 );
		expect( result.getMinutes() ).toBe( 0 );
		expect( result.getSeconds() ).toBe( 0 );
	} );
} );

describe( 'getActivePresetId', () => {
	const baseDate = new Date( 2025, 7, 25 ); // August 25, 2025

	test( 'returns undefined when required parameters are missing', () => {
		expect( getActivePresetId( undefined, baseDate, baseDate ) ).toBeUndefined();
		expect( getActivePresetId( baseDate, undefined, baseDate ) ).toBeUndefined();
		expect( getActivePresetId( baseDate, baseDate, undefined ) ).toBeUndefined();
	} );

	test( 'identifies today preset correctly', () => {
		const today = new Date( 2025, 7, 25 );
		const result = getActivePresetId( today, today, baseDate );
		expect( result ).toBe( 'today' );
	} );

	test( 'identifies yesterday preset correctly', () => {
		const yesterday = new Date( 2025, 7, 24 );
		const result = getActivePresetId( yesterday, yesterday, baseDate );
		expect( result ).toBe( 'yesterday' );
	} );

	test( 'identifies last-7-days preset correctly', () => {
		const from = new Date( 2025, 7, 19 );
		const to = new Date( 2025, 7, 25 );
		const result = getActivePresetId( from, to, baseDate );
		expect( result ).toBe( 'last-7-days' );
	} );

	test( 'identifies last-30-days preset correctly', () => {
		const from = new Date( 2025, 6, 27 ); // July 27 (30 days before Aug 25)
		const to = new Date( 2025, 7, 25 );
		const result = getActivePresetId( from, to, baseDate );
		expect( result ).toBe( 'last-30-days' );
	} );

	test( 'identifies month-to-date preset correctly', () => {
		const from = new Date( 2025, 7, 1 );
		const to = new Date( 2025, 7, 25 );
		const result = getActivePresetId( from, to, baseDate );
		expect( result ).toBe( 'month-to-date' );
	} );

	test( 'identifies year-to-date preset correctly', () => {
		const from = new Date( 2025, 0, 1 );
		const to = new Date( 2025, 7, 25 );
		const result = getActivePresetId( from, to, baseDate );
		expect( result ).toBe( 'year-to-date' );
	} );

	test( 'identifies last-12-months preset correctly', () => {
		const from = new Date( 2024, 7, 26 );
		const to = new Date( 2025, 7, 25 );
		const result = getActivePresetId( from, to, baseDate );
		expect( result ).toBe( 'last-12-months' );
	} );

	test( 'identifies last-3-years preset correctly', () => {
		const from = new Date( 2022, 7, 26 );
		const to = new Date( 2025, 7, 25 );
		const result = getActivePresetId( from, to, baseDate );
		expect( result ).toBe( 'last-3-years' );
	} );

	test( 'returns undefined for non-matching ranges', () => {
		const from = new Date( 2025, 7, 10 );
		const to = new Date( 2025, 7, 15 );
		const result = getActivePresetId( from, to, baseDate );
		expect( result ).toBeUndefined();
	} );

	test( 'swaps dates when from > to', () => {
		const from = new Date( 2025, 7, 25 );
		const to = new Date( 2025, 7, 19 );
		const result = getActivePresetId( from, to, baseDate );
		expect( result ).toBe( 'last-7-days' );
	} );
} );
