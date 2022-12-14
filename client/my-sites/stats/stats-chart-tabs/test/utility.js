/**
 * @jest-environment jsdom
 */

import { formatDate } from '../utility';

describe( 'StatsChartTabs Utilities: formatDate', () => {
	const testDate = '2022-01-01';

	test( 'Should not format a date given an invalid date', () => {
		expect( formatDate( '2022-01', 'day' ) ).toEqual( null );
		expect( formatDate( 'Apples', 'day' ) ).toEqual( null );
		expect( formatDate( true, 'day' ) ).toEqual( null );
		expect( formatDate( null, 'day' ) ).toEqual( null );
	} );

	test( 'Should not format a date given an invalid period', () => {
		expect( formatDate( testDate, 'haha' ) ).toEqual( null );
		expect( formatDate( testDate, 0 ) ).toEqual( null );
		expect( formatDate( testDate, true ) ).toEqual( null );
	} );

	test( 'Should correctly format date for "day" period', () => {
		expect( formatDate( testDate, 'day' ) ).toEqual( 'January 1, 2022' );
	} );

	test( 'Should correctly format date for "week" period', () => {
		expect( formatDate( testDate, 'week' ) ).toEqual( '1/1/2022 - 1/7/2022' );
	} );

	test( 'Should correctly format date for "month" period', () => {
		expect( formatDate( testDate, 'month' ) ).toEqual( 'January 2022' );
	} );

	test( 'Should correctly format date for "year" period', () => {
		expect( formatDate( testDate, 'year' ) ).toEqual( '2022' );
	} );
} );
