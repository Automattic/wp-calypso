/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import localStoragePolyfill from '..';

describe( 'localStorage', () => {
	describe( 'when window.localStorage does not exist', () => {
		const window = {};

		beforeAll( () => {
			localStoragePolyfill( window );
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
			localStoragePolyfill( window );
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
