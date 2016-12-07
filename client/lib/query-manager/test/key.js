/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import QueryKey from '../key';

describe( 'QueryKey', () => {
	describe( '.omit()', () => {
		it( 'should return same query if omission behavior not defined', () => {
			const original = deepFreeze( { ok: true } );
			const pruned = QueryKey.omit( original );

			expect( pruned ).to.equal( original );
		} );

		it( 'should omit values matching default query of extending class', () => {
			class QueryKeyWithDefaults extends QueryKey {
				static DEFAULT_QUERY = { ok: true };
			}

			const pruned = QueryKeyWithDefaults.omit( { ok: true, foo: null } );

			expect( pruned ).to.eql( { foo: null } );
		} );

		it( 'should omit null values if configured by extending class', () => {
			class QueryKeyWithNullOmission extends QueryKey {
				static OMIT_NULL_VALUES = true;
			}

			const pruned = QueryKeyWithNullOmission.omit( { ok: true, foo: null } );

			expect( pruned ).to.eql( { ok: true } );
		} );
	} );

	describe( '.stringify()', () => {
		it( 'should return a JSON string of the object', () => {
			const key = QueryKey.stringify( { ok: true } );

			expect( key ).to.equal( '[["ok",true]]' );
		} );

		it( 'should prune by omission behavior', () => {
			class QueryKeyWithOmission extends QueryKey {
				static DEFAULT_QUERY = { ok: true };
				static OMIT_NULL_VALUES = true;
			}

			const key = QueryKeyWithOmission.stringify( { ok: true, foo: null } );

			expect( key ).to.equal( '[]' );
		} );

		it( 'should return the same string for two objects with different property creation order', () => {
			const original = QueryKey.stringify( { a: 1, b: 2 } );
			const reversed = QueryKey.stringify( { b: 2, a: 1 } );

			expect( original ).to.equal( reversed );
		} );
	} );

	describe( '.parse()', () => {
		it( 'should return an object of the JSON string', () => {
			const query = QueryKey.parse( '[["ok",true]]' );

			expect( query ).to.eql( { ok: true } );
		} );

		it( 'should prune by omission behavior', () => {
			class QueryKeyWithOmission extends QueryKey {
				static DEFAULT_QUERY = { ok: true };
				static OMIT_NULL_VALUES = true;
			}

			const query = QueryKeyWithOmission.parse( '[["ok",true],["foo",null]]' );

			expect( query ).to.eql( {} );
		} );
	} );
} );
