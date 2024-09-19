import moment from 'moment';
import { addDayToRange } from '../utils';

describe( 'addDayToRange', () => {
	test( 'should return the same range if day is invalid', () => {
		const range = { from: moment( '2023-01-01' ), to: moment( '2023-01-05' ) };
		const result = addDayToRange( null, range );
		expect( result ).toEqual( range );
	} );

	test( 'should set "from" to null if day is the same as "from"', () => {
		const range = { from: moment( '2023-01-01' ), to: moment( '2023-01-05' ) };
		const result = addDayToRange( moment( '2023-01-01' ), range );
		expect( result.from ).toBeNull();
		expect( result.to ).toEqual( range.to );
	} );

	test( 'should set "to" to null if day is the same as "to"', () => {
		const range = { from: moment( '2023-01-01' ), to: moment( '2023-01-05' ) };
		const result = addDayToRange( moment( '2023-01-05' ), range );
		expect( result.from ).toEqual( range.from );
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

	test( 'should update "from" if day is before current "from"', () => {
		const range = { from: moment( '2023-01-05' ), to: moment( '2023-01-10' ) };
		const result = addDayToRange( moment( '2023-01-01' ), range );
		expect( result.from ).toEqual( moment( '2023-01-01' ) );
		expect( result.to ).toEqual( range.to );
	} );

	test( 'should update "to" if day is after current "to"', () => {
		const range = { from: moment( '2023-01-01' ), to: moment( '2023-01-05' ) };
		const result = addDayToRange( moment( '2023-01-10' ), range );
		expect( result.from ).toEqual( range.from );
		expect( result.to ).toEqual( moment( '2023-01-10' ) );
	} );

	test( 'should update "from" if day is closer to "from" than "to"', () => {
		const range = { from: moment( '2023-01-01' ), to: moment( '2023-01-10' ) };
		const result = addDayToRange( moment( '2023-01-04' ), range );
		expect( result.from ).toEqual( moment( '2023-01-04' ) );
		expect( result.to ).toEqual( range.to );
	} );

	test( 'should update "to" if day is closer to "to" than "from"', () => {
		const range = { from: moment( '2023-01-01' ), to: moment( '2023-01-10' ) };
		const result = addDayToRange( moment( '2023-01-07' ), range );
		expect( result.from ).toEqual( range.from );
		expect( result.to ).toEqual( moment( '2023-01-07' ) );
	} );

	test( 'should ignore time fractions', () => {
		const range = { from: moment( '2023-01-01 11:10' ), to: moment( '2023-01-17 12:00' ) };
		const result = addDayToRange( moment( '2023-01-17 :13:00' ), range );
		expect( result.from ).toEqual( range.from );
		expect( result.to ).toBeNull();
	} );
} );
