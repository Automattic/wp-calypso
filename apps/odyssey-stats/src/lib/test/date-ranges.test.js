import {
	DATE_RANGE_LAST_7_DAYS,
	DATE_RANGE_LAST_30_DAYS,
	DATE_RANGE_LAST_90_DAYS,
	DATE_RANGE_LAST_12_MONTHS,
	getDateRange,
	getRangeStartDate,
	getSiteToday,
	isDateRangeId,
	resolveDateRange,
} from '../date-ranges';

describe( 'isDateRangeId', () => {
	it( 'should accept a range the control offers', () => {
		expect( isDateRangeId( DATE_RANGE_LAST_30_DAYS ) ).toBe( true );
	} );

	it( 'should reject anything else', () => {
		[ 'last_24_hours', '', null, undefined, 7 ].forEach( ( value ) => {
			expect( isDateRangeId( value ) ).toBe( false );
		} );
	} );
} );

describe( 'getSiteToday', () => {
	afterEach( () => {
		jest.useRealTimers();
	} );

	it.each( [
		[ 14, '2026-10-02' ],
		[ 0, '2026-10-01' ],
		[ -12, '2026-09-30' ],
	] )( 'should date 11:00 UTC on Oct 1 by the site offset %s', ( gmtOffset, expected ) => {
		jest.useFakeTimers().setSystemTime( new Date( '2026-10-01T11:00:00Z' ) );
		expect( getSiteToday( gmtOffset ) ).toBe( expected );
	} );
} );

describe( 'getRangeStartDate', () => {
	it.each( [
		[ DATE_RANGE_LAST_7_DAYS, '2026-10-05', '2026-09-29' ],
		[ DATE_RANGE_LAST_30_DAYS, '2026-10-05', '2026-09-06' ],
		[ DATE_RANGE_LAST_90_DAYS, '2026-10-05', '2026-07-08' ],
		[ DATE_RANGE_LAST_12_MONTHS, '2026-10-05', '2025-11-01' ],
		[ DATE_RANGE_LAST_12_MONTHS, '2026-01-15', '2025-02-01' ],
	] )( 'should start %s ending %s on %s', ( id, endDate, expected ) => {
		expect( getRangeStartDate( getDateRange( id ), endDate ) ).toBe( expected );
	} );
} );

describe( 'resolveDateRange', () => {
	afterEach( () => {
		jest.useRealTimers();
	} );

	it( "should end on the site's today and start where the range does", () => {
		jest.useFakeTimers().setSystemTime( new Date( '2026-10-05T23:00:00Z' ) );
		expect( resolveDateRange( DATE_RANGE_LAST_7_DAYS, 2 ) ).toEqual( {
			id: DATE_RANGE_LAST_7_DAYS,
			unit: 'day',
			quantity: 7,
			startDate: '2026-09-30',
			endDate: '2026-10-06',
		} );
	} );
} );
