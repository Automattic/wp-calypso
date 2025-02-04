/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { UNITS } from '../constants';
import {
	formatValue,
	getDelta,
	getStartDate,
	getEndPeriod,
	getQueryDate,
	getUnitPeriod,
	getWidgetPath,
} from '../utils';

describe( 'getQueryDate', () => {
	test( 'should return a string', () => {
		const context = {
			params: { unit: 'day' },
			query: { startDate: '2017-06-12' },
		};
		const queryDate = getQueryDate( context );
		expect( typeof queryDate ).toBe( 'string' );
	} );

	test( 'should return a value for today given an undefined startDate queryParameter', () => {
		const context = {
			params: { unit: 'day' },
			query: { startDate: undefined },
		};
		const today = moment().format( 'YYYY-MM-DD' );
		const queryDate = getQueryDate( context );
		expect( queryDate ).toBe( today );
	} );

	test( 'should return a value for today given a startDate of less than the quantity', () => {
		const quantity = UNITS.day.quantity;
		const startDate = moment()
			.subtract( Math.floor( quantity / 2 ), 'days' )
			.format( 'YYYY-MM-DD' );
		const context = {
			params: { unit: 'day' },
			query: { startDate },
		};
		const queryDate = getQueryDate( context );
		const today = moment().format( 'YYYY-MM-DD' );
		expect( queryDate ).toBe( today );
	} );

	test( 'should return a value going back only in multiples of the specified quantity', () => {
		const quantity = UNITS.day.quantity;
		const daysBack = Math.floor( quantity * 2.5 ); // 75
		const startDate = moment().subtract( daysBack, 'days' ).format( 'YYYY-MM-DD' );
		const context = {
			params: { unit: 'day' },
			query: { startDate },
		};
		const queryDate = getQueryDate( context );
		const todayShouldBe = moment()
			.subtract( quantity * 2, 'days' )
			.format( 'YYYY-MM-DD' );
		expect( queryDate ).toBe( todayShouldBe );
	} );

	test( 'should work in weeks as well', () => {
		const quantity = UNITS.week.quantity;
		const weeksBack = Math.floor( quantity * 2.5 ); // 75
		const startDate = moment().subtract( weeksBack, 'weeks' ).format( 'YYYY-MM-DD' );
		const context = {
			params: { unit: 'week' },
			query: { startDate },
		};
		const queryDate = getQueryDate( context );
		const todayShouldBe = moment()
			.subtract( quantity * 2, 'weeks' )
			.format( 'YYYY-MM-DD' );
		expect( queryDate ).toBe( todayShouldBe );
	} );
} );

describe( 'getStartDate', () => {
	test( 'should return a string', () => {
		const queryDate = getStartDate( '2017-06-12', 'day' );
		expect( typeof queryDate ).toBe( 'string' );
	} );

	test( 'should return a value for today given an undefined startDate queryParameter', () => {
		const today = moment().format( 'YYYY-MM-DD' );
		const queryDate = getStartDate( undefined, 'day' );
		expect( queryDate ).toBe( today );
	} );

	test( 'should return a value for today given a startDate of less than the quantity', () => {
		const quantity = UNITS.day.quantity;
		const startDate = moment()
			.subtract( Math.floor( quantity / 2 ), 'days' )
			.format( 'YYYY-MM-DD' );
		const queryDate = getStartDate( startDate, 'day' );
		const today = moment().format( 'YYYY-MM-DD' );
		expect( queryDate ).toBe( today );
	} );

	test( 'should return a value going back only in multiples of the specified quantity', () => {
		const quantity = UNITS.day.quantity;
		const daysBack = Math.floor( quantity * 2.5 ); // 75
		const startDate = moment().subtract( daysBack, 'days' ).format( 'YYYY-MM-DD' );
		const queryDate = getStartDate( startDate, 'day' );
		const todayShouldBe = moment()
			.subtract( quantity * 2, 'days' )
			.format( 'YYYY-MM-DD' );
		expect( queryDate ).toBe( todayShouldBe );
	} );

	test( 'should calculate with weeks', () => {
		const quantity = UNITS.week.quantity;
		const weeksBack = Math.floor( quantity * 2.5 ); // 75
		const startDate = moment().subtract( weeksBack, 'weeks' ).format( 'YYYY-MM-DD' );
		const queryDate = getStartDate( startDate, 'week' );
		const todayShouldBe = moment()
			.subtract( quantity * 2, 'weeks' )
			.format( 'YYYY-MM-DD' );
		expect( queryDate ).toBe( todayShouldBe );
	} );

	test( 'should calculate with months', () => {
		const quantity = UNITS.month.quantity;
		const weeksBack = Math.floor( quantity * 2.5 );
		const startDate = moment().subtract( weeksBack, 'months' ).format( 'YYYY-MM-DD' );
		const queryDate = getStartDate( startDate, 'month' );
		const todayShouldBe = moment()
			.subtract( quantity * 2, 'months' )
			.format( 'YYYY-MM-DD' );
		expect( queryDate ).toBe( todayShouldBe );
	} );
} );

describe( 'getUnitPeriod', () => {
	test( 'should return a string', () => {
		const queryDate = getUnitPeriod( '2017-07-05', 'week' );
		expect( typeof queryDate ).toBe( 'string' );
	} );
	test( 'should return an isoWeek format for a week unit', () => {
		const queryDate = getUnitPeriod( '2017-07-05', 'week' );
		expect( queryDate ).toBe( '2017-W27' );
	} );
	test( 'should return a well formatted period for a month unit', () => {
		const queryDate = getUnitPeriod( '2017-07-05', 'month' );
		expect( queryDate ).toBe( '2017-07' );
	} );
	test( 'should return a well formatted period for a year unit', () => {
		const queryDate = getUnitPeriod( '2017-07-05', 'year' );
		expect( queryDate ).toBe( '2017' );
	} );
	test( 'should return a well formatted period for a day unit', () => {
		const queryDate = getUnitPeriod( '2017-07-05', 'day' );
		expect( queryDate ).toBe( '2017-07-05' );
	} );
} );

describe( 'getEndPeriod', () => {
	test( 'should return a string', () => {
		const queryDate = getEndPeriod( '2017-07-05', 'week' );
		expect( typeof queryDate ).toBe( 'string' );
	} );
	test( 'should return an the date for the end of the week', () => {
		const queryDate = getEndPeriod( '2017-07-05', 'week' );
		expect( queryDate ).toBe( '2017-07-09' );
	} );
	test( 'should return an the date for the end of the month', () => {
		const queryDate = getEndPeriod( '2017-07-05', 'month' );
		expect( queryDate ).toBe( '2017-07-31' );
	} );
	test( 'should return an the date for the end of the year', () => {
		const queryDate = getEndPeriod( '2017-07-05', 'year' );
		expect( queryDate ).toBe( '2017-12-31' );
	} );
	test( 'should return an the date for the end of the day', () => {
		const queryDate = getEndPeriod( '2017-07-05', 'day' );
		expect( queryDate ).toBe( '2017-07-05' );
	} );
} );

describe( 'formatValue', () => {
	beforeEach( () => {
		jest.spyOn( window.navigator, 'languages', 'get' ).mockImplementation( () => [ 'en-US' ] );
	} );
	test( 'should return a correctly formatted currency for NZD', () => {
		const response = formatValue( 12.34, 'currency', 'NZD' );
		expect( typeof response ).toBe( 'string' );
		expect( response ).toBe( 'NZ$12.34' );
	} );
	test( 'should return a correctly formatted currency for USD', () => {
		const response = formatValue( 12.34, 'currency', 'USD' );
		expect( typeof response ).toBe( 'string' );
		expect( response ).toBe( '$12.34' );
	} );
	test( 'should return a correctly formatted currency for ZAR', () => {
		jest.spyOn( window.navigator, 'languages', 'get' ).mockImplementation( () => [ 'en-ZA' ] );
		const response = formatValue( 12.34, 'currency', 'ZAR' );
		expect( typeof response ).toBe( 'string' );
		// see https://unicode-org.atlassian.net/browse/CLDR-14707
		// newer versions of ICU may use a dot instead of a comma as decimal separator for `en-ZA`
		expect( [ 'R 12,34', 'R 12.34' ] ).toContain( response );
	} );
	test( 'should return a correctly formatted USD currency for unknown code', () => {
		const response = formatValue( 12.34, 'currency', 'XXX' );
		expect( typeof response ).toBe( 'string' );
		expect( response ).toBe( '$12.34' );
	} );
	test( 'should return a correctly formatted USD currency for missing code', () => {
		const response = formatValue( 12.34, 'currency' );
		expect( typeof response ).toBe( 'string' );
		expect( response ).toBe( '$12.34' );
	} );
	test( 'should return a correctly formatted number to 2 decimals', () => {
		const response = formatValue( 12.3456, 'number', null, 2 );
		// assert.isNumber( response );
		expect( response ).toBe( '12.35' );
	} );
	test( 'should return a correctly formatted string', () => {
		const response = formatValue( 'string', 'text' );
		expect( typeof response ).toBe( 'string' );
		expect( response ).toBe( 'string' );
	} );
} );

const deltas = [
	{
		period: '2017-07-07',
		right: {
			right: true,
			period: '2017-07-06',
		},
		wrong: {
			right: false,
			period: '2017-07-06',
		},
	},
	{
		period: '2017-07-06',
		right: {
			right: true,
			period: '2017-07-06',
		},
		wrong: {
			right: false,
			period: '2017-07-06',
		},
	},
];
describe( 'getDelta', () => {
	test( 'should return an Object', () => {
		const delta = getDelta( deltas, '2017-07-06', 'right' );
		expect( typeof delta ).toBe( 'object' );
	} );
	test( 'should return the correct delta', () => {
		const delta = getDelta( deltas, '2017-07-06', 'right' );
		expect( delta.right ).toBe( true );
		expect( delta.period ).toBe( '2017-07-06' );
	} );
} );

describe( 'getWidgetPath', () => {
	test( 'should return a string', () => {
		const widgetPath = getWidgetPath( 'unit', 'slug', {} );
		expect( typeof widgetPath ).toBe( 'string' );
	} );

	test( 'should return a correct string', () => {
		const widgetPath = getWidgetPath( 'unit', 'slug', {} );
		expect( '/unit/slug' ).toBe( widgetPath );
	} );

	test( 'should return a correct string with one query param', () => {
		const widgetPath = getWidgetPath( 'unit', 'slug', { param1: 1 } );
		expect( '/unit/slug?param1=1' ).toBe( widgetPath );
	} );

	test( 'should return a correct string with two query params', () => {
		const widgetPath = getWidgetPath( 'unit', 'slug', { param1: 1, param2: 2 } );
		expect( '/unit/slug?param1=1&param2=2' ).toBe( widgetPath );
	} );
} );
