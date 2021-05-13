/**
 * Internal dependencies
 */
import { queryToPredicate } from '..';

describe( 'consoleDispatcher', () => {
	describe( 'queryToPredicate', () => {
		test( 'should transform RegExp to arg.type predicate function', () => {
			const predicate = queryToPredicate( /^MATCH_ME$/ );
			expect( predicate( { type: 'MATCH_ME' } ) ).toBe( true );
			expect( predicate( { type: 'DONT_MATCH_ME' } ) ).toBe( false );
		} );

		test( 'should transform string to arg.type predicate function', () => {
			const predicate = queryToPredicate( 'MATCH_ME' );
			expect( predicate( { type: 'MATCH_ME' } ) ).toBe( true );
			expect( predicate( { type: 'DONT_MATCH_ME' } ) ).toBe( false );
		} );

		test( 'should return a provided function untouched', () => {
			const predicateReturn = {};
			const predicate = queryToPredicate( () => predicateReturn );
			expect( predicate() ).toBe( predicateReturn );
		} );

		test( 'should throw an Error if unrecognized query is provided', () => {
			expect( () => queryToPredicate() ).toThrow( TypeError );
			expect( () => queryToPredicate( 1 ) ).toThrow( TypeError );
			expect( () => queryToPredicate( {} ) ).toThrow( TypeError );
		} );
	} );
} );
