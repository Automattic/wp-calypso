import { processQueryParams } from '../utils';

describe( 'processQueryParams', () => {
	describe( 'days calculation', () => {
		it( 'should default to 1 day when period is "day" and no date range is provided', () => {
			const result = processQueryParams( { period: 'day' } );
			expect( result.days ).toBe( 1 );
		} );

		it( 'should use num when provided for period "day"', () => {
			const result = processQueryParams( { period: 'day', num: 7 } );
			expect( result.days ).toBe( 7 );
		} );

		it( 'should calculate days from date range when start_date and date are provided', () => {
			const result = processQueryParams( {
				period: 'day',
				start_date: '2026-02-01',
				date: '2026-02-07',
			} );
			// 7 days from Feb 1 to Feb 7 inclusive
			expect( result.days ).toBe( 7 );
		} );

		it( 'should calculate days correctly for single day range', () => {
			const result = processQueryParams( {
				period: 'day',
				start_date: '2026-02-15',
				date: '2026-02-15',
			} );
			// Same start and end date should be 1 day
			expect( result.days ).toBe( 1 );
		} );

		it( 'should calculate days correctly for a longer range', () => {
			const result = processQueryParams( {
				period: 'day',
				start_date: '2026-01-01',
				date: '2026-01-31',
			} );
			// 31 days in January
			expect( result.days ).toBe( 31 );
		} );

		it( 'should override period-based days when date range is provided', () => {
			// Even with period 'week', if start_date and date are provided,
			// days should be calculated from the date range
			const result = processQueryParams( {
				period: 'week',
				start_date: '2026-02-01',
				date: '2026-02-28',
			} );
			// 28 days from Feb 1 to Feb 28
			expect( result.days ).toBe( 28 );
		} );

		it( 'should return 7 days for period "week" without date range', () => {
			const result = processQueryParams( { period: 'week' } );
			expect( result.days ).toBe( 7 );
		} );

		it( 'should calculate month days correctly without date range', () => {
			const result = processQueryParams( { period: 'month', date: '2026-02-15' } );
			// February 2026 has 28 days
			expect( result.days ).toBe( 28 );
		} );

		it( 'should calculate year days correctly for non-leap year without date range', () => {
			const result = processQueryParams( { period: 'year', date: '2026-06-15' } );
			// 2026 is not a leap year
			expect( result.days ).toBe( 365 );
		} );

		it( 'should calculate year days correctly for leap year without date range', () => {
			const result = processQueryParams( { period: 'year', date: '2024-06-15' } );
			// 2024 is a leap year
			expect( result.days ).toBe( 366 );
		} );
	} );

	describe( 'other query params', () => {
		it( 'should preserve existing query params', () => {
			const result = processQueryParams( {
				period: 'day',
				max: 20,
				summarize: 1,
			} );
			expect( result.max ).toBe( 20 );
			expect( result.summarize ).toBe( 1 );
		} );

		it( 'should default max to 10 when not provided', () => {
			const result = processQueryParams( {} );
			expect( result.max ).toBe( 10 );
		} );

		it( 'should allow max to be 0', () => {
			const result = processQueryParams( { max: 0 } );
			expect( result.max ).toBe( 0 );
		} );

		it( 'should default start_date to empty string when not provided', () => {
			const result = processQueryParams( {} );
			expect( result.start_date ).toBe( '' );
		} );

		it( 'should preserve start_date when provided', () => {
			const result = processQueryParams( { start_date: '2026-01-15' } );
			expect( result.start_date ).toBe( '2026-01-15' );
		} );

		it( 'should default num to 1 when not provided', () => {
			const result = processQueryParams( {} );
			expect( result.num ).toBe( 1 );
		} );
	} );
} );
