/**
 * External dependencies
 */
import { assert, expect } from 'chai';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { UNITS } from '../constants';
import {
	calculateDelta,
	formatValue,
	getDelta,
	getDeltaFromData,
	getConversionRateData,
	getStartDate,
	getEndPeriod,
	getStartPeriod,
	getQueryDate,
	getUnitPeriod,
	getWidgetPath,
} from '../utils';

describe( 'calculateDelta', () => {
	test( 'should return a correctly formed object', () => {
		const item = { doodads: 75 };
		const previousItem = { doodads: 50 };
		const delta = calculateDelta( item, previousItem, 'doodads', 'day' );
		assert.isObject( delta );
		assert.isString( delta.value );
		assert.isString( delta.since );
		assert.isArray( delta.classes );
	} );

	test( 'should return correct values', () => {
		const item = { doodads: 75 };
		const previousItem = { doodads: 50, labelDay: 'a fortnight' };
		const delta = calculateDelta( item, previousItem, 'doodads', 'day' );
		assert.equal( delta.value, '50%' );
		assert.equal( delta.since, 'since a fortnight' );
		assert.include( delta.classes, 'is-favorable' );
		assert.include( delta.classes, 'is-increase' );
	} );

	test( 'should return correct sign and direction', () => {
		const item = { doodads: 75 };
		const previousItem = { doodads: 100 };
		const delta = calculateDelta( item, previousItem, 'doodads', 'day' );
		assert.include( delta.classes, 'is-unfavorable' );
		assert.include( delta.classes, 'is-decrease' );
		assert.lengthOf( delta.classes, 2 );
	} );

	test( 'should return correct sign and direction for properties where less is good', () => {
		const item = { total_refund: 75 };
		const previousItem = { total_refund: 100 };
		const delta = calculateDelta( item, previousItem, 'total_refund', 'day' );
		assert.include( delta.classes, 'is-favorable' );
		assert.include( delta.classes, 'is-decrease' );
		assert.lengthOf( delta.classes, 2 );
	} );

	test( 'should return correct sign and direction for value of 0', () => {
		const item = { doodads: 100 };
		const previousItem = { doodads: 100 };
		const delta = calculateDelta( item, previousItem, 'doodads', 'day' );
		assert.include( delta.classes, 'is-neutral' );
		assert.lengthOf( delta.classes, 1 );
	} );
} );

describe( 'getQueryDate', () => {
	test( 'should return a string', () => {
		const context = {
			params: { unit: 'day' },
			query: { startDate: '2017-06-12' },
		};
		const queryDate = getQueryDate( context );
		assert.isString( queryDate );
	} );

	test( 'should return a value for today given an undefined startDate queryParameter', () => {
		const context = {
			params: { unit: 'day' },
			query: { startDate: undefined },
		};
		const today = moment().format( 'YYYY-MM-DD' );
		const queryDate = getQueryDate( context );
		assert.strictEqual( queryDate, today );
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
		assert.strictEqual( queryDate, today );
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
		assert.strictEqual( queryDate, todayShouldBe );
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
		assert.strictEqual( queryDate, todayShouldBe );
	} );
} );

describe( 'getStartDate', () => {
	test( 'should return a string', () => {
		const queryDate = getStartDate( '2017-06-12', 'day' );
		assert.isString( queryDate );
	} );

	test( 'should return a value for today given an undefined startDate queryParameter', () => {
		const today = moment().format( 'YYYY-MM-DD' );
		const queryDate = getStartDate( undefined, 'day' );
		assert.strictEqual( queryDate, today );
	} );

	test( 'should return a value for today given a startDate of less than the quantity', () => {
		const quantity = UNITS.day.quantity;
		const startDate = moment()
			.subtract( Math.floor( quantity / 2 ), 'days' )
			.format( 'YYYY-MM-DD' );
		const queryDate = getStartDate( startDate, 'day' );
		const today = moment().format( 'YYYY-MM-DD' );
		assert.strictEqual( queryDate, today );
	} );

	test( 'should return a value going back only in multiples of the specified quantity', () => {
		const quantity = UNITS.day.quantity;
		const daysBack = Math.floor( quantity * 2.5 ); // 75
		const startDate = moment().subtract( daysBack, 'days' ).format( 'YYYY-MM-DD' );
		const queryDate = getStartDate( startDate, 'day' );
		const todayShouldBe = moment()
			.subtract( quantity * 2, 'days' )
			.format( 'YYYY-MM-DD' );
		assert.strictEqual( queryDate, todayShouldBe );
	} );

	test( 'should calculate with weeks', () => {
		const quantity = UNITS.week.quantity;
		const weeksBack = Math.floor( quantity * 2.5 ); // 75
		const startDate = moment().subtract( weeksBack, 'weeks' ).format( 'YYYY-MM-DD' );
		const queryDate = getStartDate( startDate, 'week' );
		const todayShouldBe = moment()
			.subtract( quantity * 2, 'weeks' )
			.format( 'YYYY-MM-DD' );
		assert.strictEqual( queryDate, todayShouldBe );
	} );

	test( 'should calculate with months', () => {
		const quantity = UNITS.month.quantity;
		const weeksBack = Math.floor( quantity * 2.5 );
		const startDate = moment().subtract( weeksBack, 'months' ).format( 'YYYY-MM-DD' );
		const queryDate = getStartDate( startDate, 'month' );
		const todayShouldBe = moment()
			.subtract( quantity * 2, 'months' )
			.format( 'YYYY-MM-DD' );
		assert.strictEqual( queryDate, todayShouldBe );
	} );
} );

describe( 'getUnitPeriod', () => {
	test( 'should return a string', () => {
		const queryDate = getUnitPeriod( '2017-07-05', 'week' );
		assert.isString( queryDate );
	} );
	test( 'should return an isoWeek format for a week unit', () => {
		const queryDate = getUnitPeriod( '2017-07-05', 'week' );
		assert.strictEqual( queryDate, '2017-W27' );
	} );
	test( 'should return a well formatted period for a month unit', () => {
		const queryDate = getUnitPeriod( '2017-07-05', 'month' );
		assert.strictEqual( queryDate, '2017-07' );
	} );
	test( 'should return a well formatted period for a year unit', () => {
		const queryDate = getUnitPeriod( '2017-07-05', 'year' );
		assert.strictEqual( queryDate, '2017' );
	} );
	test( 'should return a well formatted period for a day unit', () => {
		const queryDate = getUnitPeriod( '2017-07-05', 'day' );
		assert.strictEqual( queryDate, '2017-07-05' );
	} );
} );

describe( 'getEndPeriod', () => {
	test( 'should return a string', () => {
		const queryDate = getEndPeriod( '2017-07-05', 'week' );
		assert.isString( queryDate );
	} );
	test( 'should return an the date for the end of the week', () => {
		const queryDate = getEndPeriod( '2017-07-05', 'week' );
		assert.strictEqual( queryDate, '2017-07-09' );
	} );
	test( 'should return an the date for the end of the month', () => {
		const queryDate = getEndPeriod( '2017-07-05', 'month' );
		assert.strictEqual( queryDate, '2017-07-31' );
	} );
	test( 'should return an the date for the end of the year', () => {
		const queryDate = getEndPeriod( '2017-07-05', 'year' );
		assert.strictEqual( queryDate, '2017-12-31' );
	} );
	test( 'should return an the date for the end of the day', () => {
		const queryDate = getEndPeriod( '2017-07-05', 'day' );
		assert.strictEqual( queryDate, '2017-07-05' );
	} );
} );

describe( 'getStartPeriod', () => {
	test( 'should return a string', () => {
		const queryDate = getStartPeriod( '2017-07-05', 'week' );
		assert.isString( queryDate );
	} );
	test( 'should return an the date for the first of the week', () => {
		const queryDate = getStartPeriod( '2017-07-09', 'week' );
		assert.strictEqual( queryDate, '2017-07-03' );
	} );
	test( 'should return an the date for the first of the month', () => {
		const queryDate = getStartPeriod( '2017-07-05', 'month' );
		assert.strictEqual( queryDate, '2017-07-01' );
	} );
	test( 'should return an the date for the start of the year', () => {
		const queryDate = getStartPeriod( '2017-07-05', 'year' );
		assert.strictEqual( queryDate, '2017-01-01' );
	} );
	test( 'should return an the date for the start of the day', () => {
		const queryDate = getStartPeriod( '2017-07-05', 'day' );
		assert.strictEqual( queryDate, '2017-07-05' );
	} );
} );

describe( 'formatValue', () => {
	test( 'should return a correctly formatted currency for NZD', () => {
		const response = formatValue( 12.34, 'currency', 'NZD' );
		assert.isString( response );
		assert.strictEqual( response, 'NZ$12.34' );
	} );
	test( 'should return a correctly formatted currency for USD', () => {
		const response = formatValue( 12.34, 'currency', 'USD' );
		assert.isString( response );
		assert.strictEqual( response, '$12.34' );
	} );
	test( 'should return a correctly formatted currency for ZAR', () => {
		const response = formatValue( 12.34, 'currency', 'ZAR' );
		assert.isString( response );
		assert.strictEqual( response, 'R12,34' );
	} );
	test( 'should return a correctly formatted USD currency for unknown code', () => {
		const response = formatValue( 12.34, 'currency', 'XXX' );
		assert.isString( response );
		assert.strictEqual( response, '$12.34' );
	} );
	test( 'should return a correctly formatted USD currency for missing code', () => {
		const response = formatValue( 12.34, 'currency' );
		assert.isString( response );
		assert.strictEqual( response, '$12.34' );
	} );
	test( 'should return a correctly formatted number to 2 decimals', () => {
		const response = formatValue( 12.3456, 'number', null, 2 );
		// assert.isNumber( response );
		assert.strictEqual( response, '12.35' );
	} );
	test( 'should return a correctly formatted string', () => {
		const response = formatValue( 'string', 'text' );
		assert.isString( response );
		assert.strictEqual( response, 'string' );
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
		assert.isObject( delta );
	} );
	test( 'should return the correct delta', () => {
		const delta = getDelta( deltas, '2017-07-06', 'right' );
		assert.strictEqual( delta.right, true );
		assert.strictEqual( delta.period, '2017-07-06' );
	} );
} );

const visitorData = [
	{ visitors: 11735, period: '2018-01-01' },
	{ visitors: 18513, period: '2018-02-01' },
	{ visitors: 21110, period: '2018-03-01' },
];

describe( 'getDeltaFromData', () => {
	test( 'should return an Object', () => {
		const delta = getDeltaFromData( visitorData, '2018-03-01', 'visitors', 'month' );
		assert.isObject( delta );
	} );
	test( 'should return empty if less than 3 data points are provided', () => {
		const delta = getDeltaFromData( visitorData.slice( 0, 1 ), '2018-01-01', 'visitors', 'month' );
		expect( delta ).to.eql( {} );
	} );
	test( 'should return empty if the selected date cannot be found', () => {
		const delta = getDeltaFromData( visitorData, '2018-04-01', 'visitors', 'month' );
		expect( delta ).to.eql( {} );
	} );
	test( 'should return the correct delta', () => {
		const delta = getDeltaFromData( visitorData, '2018-03-01', 'visitors', 'month' );
		assert.include( delta.classes, 'is-favorable' );
		assert.include( delta.classes, 'is-increase' );
		assert.equal( delta.value, '14%' );
	} );
} );

const orderData = [
	{
		period: '2018-01-31',
		orders: 18,
	},
	{
		period: '2018-02-28',
		orders: 13,
	},
	{
		period: '2018-03-31',
		orders: 110,
	},
];

describe( 'getConversionRateData', () => {
	test( 'should return an Array', () => {
		const data = getConversionRateData( visitorData, orderData, 'month' );
		assert.isArray( data );
	} );
	test( 'should return the correct conversion rate', () => {
		const data = getConversionRateData( visitorData, orderData, 'month' );
		/*
			2018-01
				( orders [18] ) / visitors [11735] ) * 100 = 0.15
			2018-02
				( orders [13] ) / visitors [18513] ) * 100 = 0.07
			 2018-03
				( orders [110 ] ) / visitors [21110] ) * 100 = 0.52
		*/
		expect( data ).to.eql( [
			{
				period: '2018-01',
				conversionRate: 0.15,
			},
			{
				period: '2018-02',
				conversionRate: 0.07,
			},
			{
				period: '2018-03',
				conversionRate: 0.52,
			},
		] );
	} );
	test( 'should return zero rates if there are no visitors logged', () => {
		const _visitorData = [
			{ visitors: 0, period: '2018-01-01' },
			{ visitors: 18513, period: '2018-02-01' },
			{ visitors: 21110, period: '2018-03-01' },
		];
		const data = getConversionRateData( _visitorData, orderData, 'month' );
		expect( data ).to.eql( [
			{
				period: '2018-01',
				conversionRate: 0,
			},
			{
				period: '2018-02',
				conversionRate: 0.07,
			},
			{
				period: '2018-03',
				conversionRate: 0.52,
			},
		] );
	} );
	test( 'should return zero rates if product data is not logged', () => {
		const data = getConversionRateData( visitorData, [], 'month' );
		expect( data ).to.eql( [
			{
				period: '2018-01',
				conversionRate: 0,
			},
			{
				period: '2018-02',
				conversionRate: 0,
			},
			{
				period: '2018-03',
				conversionRate: 0,
			},
		] );
	} );
} );

describe( 'getWidgetPath', () => {
	test( 'should return a string', () => {
		const widgetPath = getWidgetPath( 'unit', 'slug', {} );
		assert.isString( widgetPath );
	} );

	test( 'should return a correct string', () => {
		const widgetPath = getWidgetPath( 'unit', 'slug', {} );
		assert.strictEqual( '/unit/slug', widgetPath );
	} );

	test( 'should return a correct string with one query param', () => {
		const widgetPath = getWidgetPath( 'unit', 'slug', { param1: 1 } );
		assert.strictEqual( '/unit/slug?param1=1', widgetPath );
	} );

	test( 'should return a correct string with two query params', () => {
		const widgetPath = getWidgetPath( 'unit', 'slug', { param1: 1, param2: 2 } );
		assert.strictEqual( '/unit/slug?param1=1&param2=2', widgetPath );
	} );
} );
