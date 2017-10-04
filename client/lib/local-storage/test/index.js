/** @format */
/**
 * External dependencies
 */
import { assert } from 'chai';

describe( 'localStorage', function() {
	describe( 'when window.localStorage does not exist', function() {
		const window = {};

		before( () => {
			require( '..' )( window );
		} );

		it( 'should create a window.localStorage instance', function() {
			assert( window.localStorage );
		} );

		it( 'should correctly store and retrieve data', function() {
			window.localStorage.setItem( 'foo', 'bar' );
			assert.equal( window.localStorage.getItem( 'foo' ), 'bar' );
			assert.equal( window.localStorage.length, 1 );
		} );
	} );

	describe( 'when window.localStorage is not working correctly', function() {
		const window = {
			localStorage: {},
		};

		before( () => {
			require( '..' )( window );
		} );

		it( 'should overwrite broken or missing methods', function() {
			assert( window.localStorage.setItem );
			assert( window.localStorage.getItem );
			assert( window.localStorage.removeItem );
			assert( window.localStorage.clear );
		} );

		it( 'should correctly store and retrieve data', function() {
			window.localStorage.setItem( 'foo', 'bar' );
			assert.equal( window.localStorage.getItem( 'foo' ), 'bar' );
			assert.equal( window.localStorage.length, 1 );
		} );
	} );
} );
