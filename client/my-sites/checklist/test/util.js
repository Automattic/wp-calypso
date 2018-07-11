/** @format */

/**
 * Internal dependencies
 */
import { mergeObjectIntoArrayById } from '../util';

describe( 'mergeObjectIntoArrayById', () => {
	test( 'should produce a new array', () => {
		const arr = [ { id: 'a', prop: 'prop' } ];
		const obj = { a: { newProp: 'newProp' } };
		expect( mergeObjectIntoArrayById( arr, obj ) ).not.toBe( arr );
	} );

	test( 'should produce a new object when merging', () => {
		const arr = [ { id: 'a', prop: 'prop' } ];
		const obj = { a: { newProp: 'newProp' } };

		const result = mergeObjectIntoArrayById( arr, obj );
		expect( result[ 0 ] ).not.toBe( arr[ 0 ] );
		expect( result[ 0 ] ).not.toBe( obj );
	} );

	test( 'should not replace unchanged objects', () => {
		const arr = [ { id: 'a', prop: 'prop' }, { id: 'b' } ];
		const obj = { a: { newProp: 'newProp' } };

		expect( mergeObjectIntoArrayById( arr, obj )[ 1 ] ).toBe( arr[ 1 ] );
	} );

	test( 'should overwrite existing props', () => {
		const arr = [ { id: 'a', prop: 'prop' } ];
		const obj = { a: { prop: 'updated' } };

		expect( mergeObjectIntoArrayById( arr, obj ) ).toEqual( [
			{
				id: 'a',
				prop: 'updated',
			},
		] );
	} );

	test( 'should keep existing props', () => {
		const arr = [ { id: 'a', prop: 'prop', untouched: 'stay-the-same' } ];
		const obj = { a: { prop: 'updated' } };

		expect( mergeObjectIntoArrayById( arr, obj ) ).toEqual( [
			{
				id: 'a',
				prop: 'updated',
				untouched: 'stay-the-same',
			},
		] );
	} );

	test( 'should add new props', () => {
		const arr = [ { id: 'a', prop: 'prop' } ];
		const obj = { a: { newProp: 'add me' } };

		expect( mergeObjectIntoArrayById( arr, obj ) ).toEqual( [
			{
				id: 'a',
				prop: 'prop',
				newProp: 'add me',
			},
		] );
	} );

	test( 'should ignore object keys not present in the array', () => {
		const arr = [ { id: 'a', prop: 'prop' } ];
		const obj = { c: { ignore: 'me' } };

		expect( mergeObjectIntoArrayById( arr, obj ) ).toEqual( [
			{
				id: 'a',
				prop: 'prop',
			},
		] );
	} );
} );
