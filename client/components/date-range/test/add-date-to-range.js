import moment from 'moment';
import { addDayToRange } from '../utils';

describe( 'addDayToRange', () => {
	test( 'should return the same range if day is invalid', () => {
		const range = { from: moment( '2023-01-01' ), to: moment( '2023-01-05' ) };
		const result = addDayToRange( null, range );
		expect( result ).toEqual( range );
	} );

	test( 'should start a new range if day is the same as "from" in a complete range', () => {
		const range = { from: moment( '2023-01-01' ), to: moment( '2023-01-05' ) };
		const result = addDayToRange( moment( '2023-01-01' ), range );
		expect( result.from ).toEqual( moment( '2023-01-01' ) );
		expect( result.to ).toBeNull();
	} );

	test( 'should start a new range if day is the same as "to" in a complete range', () => {
		const range = { from: moment( '2023-01-01' ), to: moment( '2023-01-05' ) };
		const result = addDayToRange( moment( '2023-01-05' ), range );
		expect( result.from ).toEqual( moment( '2023-01-05' ) );
		expect( result.to ).toBeNull();
	} );

	test( 'should set "from" if it is null', () => {
		const range = { from: null, to: moment( '2023-01-05' ) };
		const result = addDayToRange( moment( '2023-01-01' ), range );
		expect( result.from ).toEqual( moment( '2023-01-01' ) );
		expect( result.to ).toEqual( range.to );
	} );

	test( 'should set "to" if it is null', () => {
		const range = { from: moment( '2023-01-01' ), to: null };
		const result = addDayToRange( moment( '2023-01-05' ), range );
		expect( result.from ).toEqual( range.from );
		expect( result.to ).toEqual( moment( '2023-01-05' ) );
	} );

	test( 'should set a one-day range when the second selected day matches "from"', () => {
		const range = { from: moment( '2023-01-05' ), to: null };
		const result = addDayToRange( moment( '2023-01-05' ), range );
		expect( result.from ).toEqual( moment( '2023-01-05' ) );
		expect( result.to ).toEqual( moment( '2023-01-05' ) );
	} );

	test( 'should order dates when the second selected day is before "from"', () => {
		const range = { from: moment( '2023-01-05' ), to: null };
		const result = addDayToRange( moment( '2023-01-01' ), range );
		expect( result.from ).toEqual( moment( '2023-01-01' ) );
		expect( result.to ).toEqual( moment( '2023-01-05' ) );
	} );

	test( 'should reset the range with day as "from" when day is before a complete range', () => {
		const range = { from: moment( '2023-01-05' ), to: moment( '2023-01-10' ) };
		const result = addDayToRange( moment( '2023-01-01' ), range );
		expect( result.from ).toEqual( moment( '2023-01-01' ) );
		expect( result.to ).toBeNull();
	} );

	test( 'should reset the range with day as "from" when day is after a complete range', () => {
		const range = { from: moment( '2023-01-01' ), to: moment( '2023-01-05' ) };
		const result = addDayToRange( moment( '2023-01-10' ), range );
		expect( result.from ).toEqual( moment( '2023-01-10' ) );
		expect( result.to ).toBeNull();
	} );

	test( 'should reset the range with day as "from" when day is inside a complete range', () => {
		const range = { from: moment( '2023-01-01' ), to: moment( '2023-01-10' ) };
		const result = addDayToRange( moment( '2023-01-04' ), range );
		expect( result.from ).toEqual( moment( '2023-01-04' ) );
		expect( result.to ).toBeNull();
	} );

	test( 'should ignore time fractions', () => {
		const range = { from: moment( '2023-01-01 11:10' ), to: null };
		const result = addDayToRange( moment( '2023-01-17 13:00' ), range );
		expect( result.from.format( 'YYYY-MM-DD HH:mm' ) ).toEqual( '2023-01-01 00:00' );
		expect( result.to.format( 'YYYY-MM-DD HH:mm' ) ).toEqual( '2023-01-17 00:00' );
	} );
} );
