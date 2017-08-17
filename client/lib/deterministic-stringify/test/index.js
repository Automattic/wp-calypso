/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import stringify from 'lib/deterministic-stringify';

describe( 'deterministicStringify', function() {
	it( 'should stringify boolean', () => {
		expect( stringify( true ) ).to.equal( 'true' );
		expect( stringify( false ) ).to.equal( 'false' );
	} );

	it( 'should produce an integer from a whole number', () => {
		expect( stringify( 1 ) ).to.equal( '1' );
		expect( stringify( -1 ) ).to.equal( '-1' );
		expect( stringify( 1.0 ) ).to.equal( '1' );
	} );

	it( 'should product a fractional value from a floating-point number', () => {
		expect( stringify( 1.2 ) ).to.equal( '1.2' );
	} );

	it( 'should stringify numeric extremes', () => {
		expect( stringify( NaN ) ).to.equal( 'NaN' );
		expect( stringify( Infinity ) ).to.equal( 'Infinity' );
		expect( stringify( -Infinity ) ).to.equal( '-Infinity' );
	} );

	it( 'should stringify null', () => {
		expect( stringify( null ) ).to.equal( 'null' );
	} );

	it( 'should stringify undefined', () => {
		expect( stringify( undefined ) ).to.equal( 'undefined' );
	} );

	it( 'should sort arrays', () => {
		expect( stringify( [ 2, 1, 3 ] ) ).to.equal( '1,2,3' );
		expect( stringify( [ 2, 1, 3 ] ) ).to.equal( stringify( [ 1, 2, 3 ] ) );
	} );

	/**
	 * This test doesn't need to indicate nominal behavior so much
	 * as check for changes in behavior and point out an aspect of
	 * the function that may not be obvious to the caller.
	 */
	it( 'actually sorts lexicographically', () => {
		expect( stringify( [ 10, 2 ] ) ).to.equal( '10,2' );
	} );

	it( 'should handle nested objects', () => {
		expect( stringify( [ 1, { a: 1 } ] ) ).to.equal( '1,a=1' );
	} );

	it( 'should handle boolean as object values', () => {
		expect( stringify( { a: true } ) ).to.equal( 'a=true' );
	} );

	it( 'should alphabetize object attributes', () => {
		expect( stringify( { b: 1, a: [ 'b', 'a' ] } ) ).to.equal( "a='a','b'&b=1" );
	} );

	it( 'should allow nesting and sort nested arrays', () => {
		expect( stringify( { a: [ 'blah', 'a', 'c' ] } ) ).to.equal( "a='a','blah','c'" );
	} );

	it( 'should produce deterministic strings regardless of attribute or array order', () => {
		const options = {
			b: [ 2, 1 ],
			a: true
		};

		const optionsDifferentSort = {
			a: true,
			b: [ 1, 2 ]
		};

		expect( stringify( options ) ).to.eql( stringify( optionsDifferentSort ) );
	} );
} );
