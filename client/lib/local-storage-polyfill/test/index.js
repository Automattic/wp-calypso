/**
 * External dependencies
 */
import { assert } from 'chai';

describe( 'localStorage', () => {
	describe( 'when window.localStorage does not exist', () => {
		const window = {};

		beforeAll( () => {
			require( '..' )( window );
		} );

		test( 'should create a window.localStorage instance', () => {
			assert( window.localStorage );
		} );

		test( 'should correctly store and retrieve data', () => {
			window.localStorage.setItem( 'foo', 'bar' );
			assert.equal( window.localStorage.getItem( 'foo' ), 'bar' );
			assert.equal( window.localStorage.length, 1 );
		} );
	} );

	describe( 'when window.localStorage is not working correctly', () => {
		const window = {
			localStorage: {},
		};

		beforeAll( () => {
			require( '..' )( window );
		} );

		test( 'should overwrite broken or missing methods', () => {
			assert( window.localStorage.setItem );
			assert( window.localStorage.getItem );
			assert( window.localStorage.removeItem );
			assert( window.localStorage.clear );
		} );

		test( 'should correctly store and retrieve data', () => {
			window.localStorage.setItem( 'foo', 'bar' );
			assert.equal( window.localStorage.getItem( 'foo' ), 'bar' );
			assert.equal( window.localStorage.length, 1 );
		} );
	} );
} );
