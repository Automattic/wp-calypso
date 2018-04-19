/** @format */
/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import QueryKey from '../key';

describe( 'QueryKey', () => {
	describe( '.omit()', () => {
		test( 'should return same query if omission behavior not defined', () => {
			const original = deepFreeze( { ok: true } );
			const pruned = QueryKey.omit( original );

			expect( pruned ).toBe( original );
		} );

		test( 'should omit values matching default query of extending class', () => {
			class QueryKeyWithDefaults extends QueryKey {
				static DEFAULT_QUERY = { ok: true };
			}

			const pruned = QueryKeyWithDefaults.omit( { ok: true, foo: null } );

			expect( pruned ).toEqual( { foo: null } );
		} );

		test( 'should omit null values if configured by extending class', () => {
			class QueryKeyWithNullOmission extends QueryKey {
				static OMIT_NULL_VALUES = true;
			}

			const pruned = QueryKeyWithNullOmission.omit( { ok: true, foo: null } );

			expect( pruned ).toEqual( { ok: true } );
		} );
	} );

	describe( '.stringify()', () => {
		test( 'should return a JSON string of the object', () => {
			const key = QueryKey.stringify( { ok: true } );

			expect( key ).toBe( '[["ok",true]]' );
		} );

		test( 'should prune by omission behavior', () => {
			class QueryKeyWithOmission extends QueryKey {
				static DEFAULT_QUERY = { ok: true };
				static OMIT_NULL_VALUES = true;
			}

			const key = QueryKeyWithOmission.stringify( { ok: true, foo: null } );

			expect( key ).toBe( '[]' );
		} );

		test( 'should return the same string for two objects with different property creation order', () => {
			const original = QueryKey.stringify( { a: 1, b: 2 } );
			const reversed = QueryKey.stringify( { b: 2, a: 1 } );

			expect( original ).toBe( reversed );
		} );
	} );

	describe( '.parse()', () => {
		test( 'should return an object of the JSON string', () => {
			const query = QueryKey.parse( '[["ok",true]]' );

			expect( query ).toEqual( { ok: true } );
		} );

		test( 'should prune by omission behavior', () => {
			class QueryKeyWithOmission extends QueryKey {
				static DEFAULT_QUERY = { ok: true };
				static OMIT_NULL_VALUES = true;
			}

			const query = QueryKeyWithOmission.parse( '[["ok",true],["foo",null]]' );

			expect( query ).toEqual( {} );
		} );
	} );
} );
