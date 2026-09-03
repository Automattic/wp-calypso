/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { getSummaryDateRangeFromQuery } from '../controller';

// The controller uses a site-timezone-aware moment factory; plain `moment` is a
// sufficient stand-in for exercising the parsing/precedence logic.
const momentSiteZone = ( ...args ) => moment( ...args );

const format = ( m ) => ( m ? m.format( 'YYYY-MM-DD' ) : m );

describe( 'getSummaryDateRangeFromQuery', () => {
	it( 'prefers a valid chartStart/chartEnd range', () => {
		const { date, dateRange } = getSummaryDateRangeFromQuery(
			{ chartStart: '2024-07-10', chartEnd: '2025-07-09' },
			momentSiteZone,
			'day'
		);

		expect( format( date ) ).toBe( '2024-07-10' );
		expect( format( dateRange.startDate ) ).toBe( '2024-07-10' );
		expect( format( dateRange.endDate ) ).toBe( '2025-07-09' );
	} );

	it( 'gives chartStart/chartEnd precedence over legacy startDate/endDate', () => {
		const { date, dateRange } = getSummaryDateRangeFromQuery(
			{
				chartStart: '2024-01-01',
				chartEnd: '2024-12-31',
				startDate: '2020-01-01',
				endDate: '2020-02-01',
			},
			momentSiteZone,
			'day'
		);

		expect( format( date ) ).toBe( '2024-01-01' );
		expect( format( dateRange.startDate ) ).toBe( '2024-01-01' );
		expect( format( dateRange.endDate ) ).toBe( '2024-12-31' );
	} );

	it( 'ignores an invalid chartStart and falls back to the period end', () => {
		const { date, dateRange } = getSummaryDateRangeFromQuery(
			{ chartStart: '2025-13-40', chartEnd: '2025-07-09' },
			momentSiteZone,
			'day'
		);

		expect( format( date ) ).toBe( momentSiteZone().endOf( 'day' ).format( 'YYYY-MM-DD' ) );
		expect( dateRange ).toBeNull();
	} );

	it( 'ignores a chartEnd that is before chartStart', () => {
		const { dateRange } = getSummaryDateRangeFromQuery(
			{ chartStart: '2025-07-09', chartEnd: '2024-07-10' },
			momentSiteZone,
			'day'
		);

		expect( dateRange ).toBeNull();
	} );

	it( 'requires both chart bounds and falls back when only chartStart is present', () => {
		const { date, dateRange } = getSummaryDateRangeFromQuery(
			{ chartStart: '2024-07-10', startDate: '2024-07-01' },
			momentSiteZone,
			'day'
		);

		expect( format( date ) ).toBe( '2024-07-01' );
		expect( dateRange ).toBeNull();
	} );

	it( 'keeps back-compat with legacy startDate/endDate ranges', () => {
		const { date, dateRange } = getSummaryDateRangeFromQuery(
			{ startDate: '2024-07-01', endDate: '2024-07-31' },
			momentSiteZone,
			'day'
		);

		expect( format( date ) ).toBe( '2024-07-01' );
		expect( format( dateRange.startDate ) ).toBe( '2024-07-01' );
		expect( format( dateRange.endDate ) ).toBe( '2024-07-31' );
	} );

	it( 'keeps back-compat with a lone startDate (no range)', () => {
		const { date, dateRange } = getSummaryDateRangeFromQuery(
			{ startDate: '2024-07-01' },
			momentSiteZone,
			'day'
		);

		expect( format( date ) ).toBe( '2024-07-01' );
		expect( dateRange ).toBeNull();
	} );

	it( 'defaults to the end of the period when nothing is provided', () => {
		const { date, dateRange } = getSummaryDateRangeFromQuery( {}, momentSiteZone, 'month' );

		expect( format( date ) ).toBe( momentSiteZone().endOf( 'month' ).format( 'YYYY-MM-DD' ) );
		expect( dateRange ).toBeNull();
	} );
} );
