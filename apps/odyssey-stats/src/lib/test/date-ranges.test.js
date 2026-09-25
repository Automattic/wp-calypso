import {
	DATE_RANGES,
	DATE_RANGE_LAST_7_DAYS,
	DATE_RANGE_LAST_30_DAYS,
	DATE_RANGE_LAST_90_DAYS,
	DATE_RANGE_LAST_12_MONTHS,
	DEFAULT_DATE_RANGE_ID,
	getDateRange,
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
	it( 'should accept every supported range id', () => {
		DATE_RANGES.forEach( ( range ) => {
			expect( isDateRangeId( range.id ) ).toBe( true );
		} );
	} );

	it( 'should reject anything else', () => {
		[ 'last_24_hours', '', null, undefined, 7 ].forEach( ( value ) => {
			expect( isDateRangeId( value ) ).toBe( false );
		} );
	} );
} );

describe( 'DATE_RANGES', () => {
	it( 'should expose a valid default', () => {
		expect( isDateRangeId( DEFAULT_DATE_RANGE_ID ) ).toBe( true );
	} );

	it( 'should not repeat an id', () => {
		const ids = DATE_RANGES.map( ( range ) => range.id );
		expect( new Set( ids ).size ).toBe( ids.length );
	} );
} );
