/**
 * @jest-environment jsdom
 */

import { formatDate, getQueryDate } from '../utility';

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
		expect( formatDate( testDate, 'week' ) ).toEqual( '12/27/2021 - 1/2/2022' );
	} );

	test( 'Should correctly format date for "month" period', () => {
		expect( formatDate( testDate, 'month' ) ).toEqual( 'January 2022' );
	} );

	test( 'Should correctly format date for "year" period', () => {
		expect( formatDate( testDate, 'year' ) ).toEqual( '2022' );
	} );
} );

describe( 'StatsChartTabs Utilities: getQueryDate', () => {
	const options = {
		desiredDateString: '2022-01-01',
		period: 'day',
		quantity: 30,
		timezoneOffset: 0,
		todayDateString: '2022-04-01',
	};

	test( 'Should return null for invalid query date strings', () => {
		const invalidOptions = { ...options };
		delete invalidOptions.desiredDateString;
		expect( getQueryDate( invalidOptions ) ).toEqual( null ); // desiredDateString is a required value.
		expect( getQueryDate( { desiredDateString: '2022-01', ...invalidOptions } ) ).toEqual( null );
		expect( getQueryDate( { desiredDateString: 'Apples', ...invalidOptions } ) ).toEqual( null );
		expect( getQueryDate( { desiredDateString: true, ...invalidOptions } ) ).toEqual( null );
		expect( getQueryDate( { desiredDateString: null, ...invalidOptions } ) ).toEqual( null );
	} );

	test( 'Should return the appropriate date for a "day" period', () => {
		expect( getQueryDate( { ...options } ) ).toEqual( '2022-01-01' );
	} );

	test( 'Should return the appropriate date for a "week" period', () => {
		expect( getQueryDate( { ...options, period: 'week' } ) ).toEqual( '2022-04-03' );
	} );

	test( 'Should return the appropriate date for a "month" period', () => {
		expect( getQueryDate( { ...options, period: 'month' } ) ).toEqual( '2022-04-30' );
	} );

	test( 'Should return the appropriate date for a "year" period', () => {
		expect( getQueryDate( { ...options, period: 'year', quantity: 10 } ) ).toEqual( '2022-12-31' );
	} );

	test( 'Should return the appropriate date with negative or positive timezone offsets', () => {
		expect( getQueryDate( { ...options, timezoneOffset: -1 } ) ).toEqual( '2021-12-31' );
		expect( getQueryDate( { ...options, timezoneOffset: 1 } ) ).toEqual( '2022-01-01' );
	} );
} );
