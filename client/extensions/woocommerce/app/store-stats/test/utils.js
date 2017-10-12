/** @format */

/**
 * External dependencies
 */
import { moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { UNITS } from '../constants';
import {
	calculateDelta,
	formatValue,
	getDelta,
	getEndPeriod,
	getQueryDate,
	getUnitPeriod,
} from '../utils';

describe( 'calculateDelta', () => {
	test( 'should return a correctly formed object', () => {
		const item = { doodads: 75 };
		const previousItem = { doodads: 50 };
		const delta = calculateDelta( item, previousItem, 'doodads', 'day' );
		expect( typeof delta ).toBe( 'object' );
		expect( typeof delta.value ).toBe( 'string' );
		expect( typeof delta.since ).toBe( 'string' );
		expect( Array.isArray( delta.classes ) ).toBe( true );
	} );

	test( 'should return correct values', () => {
		const item = { doodads: 75 };
		const previousItem = { doodads: 50, labelDay: 'a fortnight' };
		const delta = calculateDelta( item, previousItem, 'doodads', 'day' );
		expect( delta.value ).toEqual( '50%' );
		expect( delta.since ).toEqual( 'since a fortnight' );
		expect( delta.classes ).toContain( 'is-favorable' );
		expect( delta.classes ).toContain( 'is-increase' );
	} );

	test( 'should return correct sign and direction', () => {
		const item = { doodads: 75 };
		const previousItem = { doodads: 100 };
		const delta = calculateDelta( item, previousItem, 'doodads', 'day' );
		expect( delta.classes ).toContain( 'is-unfavorable' );
		expect( delta.classes ).toContain( 'is-decrease' );
		expect( delta.classes.length ).toBe( 2 );
	} );

	test( 'should return correct sign and direction for properties where less is good', () => {
		const item = { total_refund: 75 };
		const previousItem = { total_refund: 100 };
		const delta = calculateDelta( item, previousItem, 'total_refund', 'day' );
		expect( delta.classes ).toContain( 'is-favorable' );
		expect( delta.classes ).toContain( 'is-decrease' );
		expect( delta.classes.length ).toBe( 2 );
	} );

	test( 'should return correct sign and direction for value of 0', () => {
		const item = { doodads: 100 };
		const previousItem = { doodads: 100 };
		const delta = calculateDelta( item, previousItem, 'doodads', 'day' );
		expect( delta.classes ).toContain( 'is-neutral' );
		expect( delta.classes.length ).toBe( 1 );
	} );
} );

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
		const startDate = moment()
			.subtract( daysBack, 'days' )
			.format( 'YYYY-MM-DD' );
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
		const startDate = moment()
			.subtract( weeksBack, 'weeks' )
			.format( 'YYYY-MM-DD' );
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
		const response = formatValue( 12.34, 'currency', 'ZAR' );
		expect( typeof response ).toBe( 'string' );
		expect( response ).toBe( 'R12,34' );
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
		const response = formatValue( 12.3456, 'number' );
		expect( typeof response ).toBe( 'number' );
		expect( response ).toBe( 12.35 );
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
