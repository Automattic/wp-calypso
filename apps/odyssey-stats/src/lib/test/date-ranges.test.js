import {
	DATE_RANGES,
	DATE_RANGE_LAST_7_DAYS,
	DATE_RANGE_LAST_30_DAYS,
	DATE_RANGE_LAST_90_DAYS,
	DATE_RANGE_LAST_12_MONTHS,
	DEFAULT_DATE_RANGE_ID,
	getDateRange,
	getRangeStartDate,
	isDateRangeId,
} from '../date-ranges';

describe( 'getDateRange', () => {
	it( 'should map the 7 day range to a week of daily buckets', () => {
		expect( getDateRange( DATE_RANGE_LAST_7_DAYS ) ).toEqual( {
			id: DATE_RANGE_LAST_7_DAYS,
			unit: 'day',
			quantity: 7,
		} );
	} );

	it( 'should map the 30 day range to a month of daily buckets', () => {
		expect( getDateRange( DATE_RANGE_LAST_30_DAYS ) ).toEqual( {
			id: DATE_RANGE_LAST_30_DAYS,
			unit: 'day',
			quantity: 30,
		} );
	} );

	it( 'should map the 90 day range to a quarter of daily buckets', () => {
		expect( getDateRange( DATE_RANGE_LAST_90_DAYS ) ).toEqual( {
			id: DATE_RANGE_LAST_90_DAYS,
			unit: 'day',
			quantity: 90,
		} );
	} );

	it( 'should map the 12 month range to a year of monthly buckets', () => {
		expect( getDateRange( DATE_RANGE_LAST_12_MONTHS ) ).toEqual( {
			id: DATE_RANGE_LAST_12_MONTHS,
			unit: 'month',
			quantity: 12,
		} );
	} );

	it( 'should fall back to the default range for unrecognised values', () => {
		const fallback = getDateRange( DEFAULT_DATE_RANGE_ID );

		[ 'last_24_hours', '', null, undefined, 7 ].forEach( ( value ) => {
			expect( getDateRange( value ) ).toEqual( fallback );
		} );
	} );
} );

describe( 'isDateRangeId', () => {
	it( 'should reject anything else', () => {
		[ 'last_24_hours', '', null, undefined, 7 ].forEach( ( value ) => {
			expect( isDateRangeId( value ) ).toBe( false );
		} );
	} );
} );

describe( 'DATE_RANGES', () => {
	it( 'should not repeat an id', () => {
		const ids = DATE_RANGES.map( ( range ) => range.id );
		expect( new Set( ids ).size ).toBe( ids.length );
	} );
} );

describe( 'getRangeStartDate', () => {
	// The lists are summarized, where the API counts days whatever period it is given, so
	// each range has to state its own first day.
	it.each( [
		[ DATE_RANGE_LAST_7_DAYS, '2026-09-29' ],
		[ DATE_RANGE_LAST_30_DAYS, '2026-09-06' ],
		[ DATE_RANGE_LAST_90_DAYS, '2026-07-08' ],
	] )( 'counts %s back in whole days, today included', ( id, expected ) => {
		expect( getRangeStartDate( getDateRange( id ), '2026-10-05' ) ).toBe( expected );
	} );

	it( 'starts the 12 month range at the first of its earliest month', () => {
		expect( getRangeStartDate( getDateRange( DATE_RANGE_LAST_12_MONTHS ), '2026-10-05' ) ).toBe(
			'2025-11-01'
		);
	} );

	it( 'covers a year of months rather than a year of days', () => {
		const start = getRangeStartDate( getDateRange( DATE_RANGE_LAST_12_MONTHS ), '2026-01-15' );
		expect( start ).toBe( '2025-02-01' );
	} );
} );
