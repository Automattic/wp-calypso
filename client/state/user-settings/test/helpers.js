/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { setValue, removeValue } from '../helpers';

describe( 'setValue()', () => {
	test( 'should set simple key to value in obj and return a new object', () => {
		const state = deepFreeze( {} );

		const result = setValue( state, 'foo', 'bar' );
		expect( result ).toEqual( { foo: 'bar' } );
	} );

	test( 'should set simple key to value in obj and keep existing values', () => {
		const state = deepFreeze( { baz: 'qux' } );

		const result = setValue( state, 'foo', 'bar' );
		expect( result ).toEqual( { foo: 'bar', baz: 'qux' } );
	} );

	test( 'should set simple key to value in obj and keep existing nested values', () => {
		const state = deepFreeze( { foo: { bar: 'baz' } } );

		const result = setValue( state, 'qux', 'quz' );
		expect( result ).toEqual( { foo: { bar: 'baz' }, qux: 'quz' } );
	} );

	test( 'should set nested key to value in obj and return a new object', () => {
		const state = deepFreeze( {} );

		const result = setValue( state, [ 'foo', 'bar' ], 'baz' );
		expect( result ).toEqual( { foo: { bar: 'baz' } } );
	} );

	test( 'should set nested key to value in obj and keep existing value', () => {
		const state = deepFreeze( { foo: 'bar' } );

		const result = setValue( state, [ 'baz', 'qux' ], 'quz' );
		expect( result ).toEqual( { foo: 'bar', baz: { qux: 'quz' } } );
	} );

	test( 'should set nested key to value in obj and keep existing (other) nested values', () => {
		const state = deepFreeze( { foo: { bar: 'baz' } } );

		const result = setValue( state, [ 'foo', 'qux' ], 'quz' );
		expect( result ).toEqual( { foo: { bar: 'baz', qux: 'quz' } } );
	} );

	test( 'should set nested key to value in obj and overwrite if key is already set', () => {
		const state = deepFreeze( { foo: { bar: 'baz' } } );

		const result = setValue( state, [ 'foo', 'bar' ], 'qux' );
		expect( result ).toEqual( { foo: { bar: 'qux' } } );
	} );

	test( 'should set deeply nested key to value in obj', () => {
		const state = deepFreeze( {} );

		const result = setValue( state, [ 'foo', 'bar', 'baz' ], 'qux' );
		expect( result ).toEqual( { foo: { bar: { baz: 'qux' } } } );
	} );

	test( 'should set deeply nested key to value in obj and keep others', () => {
		const state = deepFreeze( { abc: 'def' } );

		const result = setValue( state, [ 'foo', 'bar', 'baz' ], 'qux' );
		expect( result ).toEqual( { foo: { bar: { baz: 'qux' } }, abc: 'def' } );
	} );

	test( 'should set deeply nested key to value in obj and keep other nested ones', () => {
		const state = deepFreeze( { foo: { bar: 'baz' } } );

		const result = setValue( state, [ 'foo', 'abc', 'def' ], 'qux' );
		expect( result ).toEqual( { foo: { bar: 'baz', abc: { def: 'qux' } } } );
	} );

	test( 'should overwrite existing keys if value is already set (not null)', () => {
		const state = deepFreeze( { foo: 1 } );

		const result = setValue( state, [ 'foo', 'bar' ], 'baz' );
		expect( result ).toEqual( { foo: { bar: 'baz' } } );
	} );

	test( 'should overwrite existing keys if value is set to `null`', () => {
		const state = deepFreeze( { foo: null } );

		const result = setValue( state, [ 'foo', 'bar' ], 'baz' );
		expect( result ).toEqual( { foo: { bar: 'baz' } } );
	} );

	test( 'should overwrite existing keys if value is set to `undefined`', () => {
		const state = deepFreeze( { foo: undefined } );

		const result = setValue( state, [ 'foo', 'bar' ], 'baz' );
		expect( result ).toEqual( { foo: { bar: 'baz' } } );
	} );
} );

describe( 'removeValue()', () => {
	test( 'should remove simple value from obj', () => {
		const state = deepFreeze( { foo: 'bar' } );

		const result = removeValue( state, 'foo' );
		expect( result ).toEqual( {} );
	} );

	test( 'should remove simple value from obj but keep others', () => {
		const state = deepFreeze( { foo: 'bar', baz: 'qux' } );

		const result = removeValue( state, 'foo' );
		expect( result ).toEqual( { baz: 'qux' } );
	} );

	test( 'should remove simple value from obj but keep nested others', () => {
		const state = deepFreeze( { foo: 'bar', baz: { qux: 'quz' } } );

		const result = removeValue( state, 'foo' );
		expect( result ).toEqual( { baz: { qux: 'quz' } } );
	} );

	test( 'should remove nested value from obj', () => {
		const state = deepFreeze( { foo: { bar: 'baz' } } );

		const result = removeValue( state, [ 'foo', 'bar' ] );
		expect( result ).toEqual( {} );
	} );

	test( 'should remove nested value from obj but keep other simple attributes', () => {
		const state = deepFreeze( { foo: { bar: 'baz' }, qux: 'quz' } );

		const result = removeValue( state, [ 'foo', 'bar' ] );
		expect( result ).toEqual( { qux: 'quz' } );
	} );

	test( 'should remove nested value from obj but keep key if it contains more attributes', () => {
		const state = deepFreeze( { foo: { bar: 'baz', qux: 'quz' } } );

		const result = removeValue( state, [ 'foo', 'bar' ] );
		expect( result ).toEqual( { foo: { qux: 'quz' } } );
	} );

	test( 'should remove deeply nested value from obj', () => {
		const state = deepFreeze( { foo: { bar: { baz: 'qux' } } } );

		const result = removeValue( state, [ 'foo', 'bar', 'baz' ] );
		expect( result ).toEqual( {} );
	} );

	test( 'should remove deeply nested value from obj and keep others', () => {
		const state = deepFreeze( { foo: { bar: { baz: 'qux' } }, abc: 'def' } );

		const result = removeValue( state, [ 'foo', 'bar', 'baz' ] );
		expect( result ).toEqual( { abc: 'def' } );
	} );

	test( 'should remove deeply nested value from obj and keep other nested ones', () => {
		const state = deepFreeze( { foo: { bar: { baz: 'qux' }, abc: 'def' } } );

		const result = removeValue( state, [ 'foo', 'bar', 'baz' ] );
		expect( result ).toEqual( { foo: { abc: 'def' } } );
	} );

	test( 'should ignore values which are not set', () => {
		const state = deepFreeze( { foo: { bar: 'baz' } } );

		const result = removeValue( state, [ 'foo', 'qux' ] );
		expect( result ).toEqual( { foo: { bar: 'baz' } } );
	} );
} );
