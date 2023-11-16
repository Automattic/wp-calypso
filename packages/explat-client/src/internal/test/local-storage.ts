/**
 * @jest-environment jsdom
 */

import { polyfilledLocalStorage as localStorage } from '../local-storage';

beforeEach( () => {
	localStorage.clear();
} );

describe( 'length', () => {
	it( 'should return 0 when localStorage is empty', () => {
		expect( localStorage.length ).toBe( 0 );
	} );

	it( 'should return the correct length after items are added', () => {
		localStorage.setItem( 'key1', 'value1' );
		expect( localStorage.length ).toBe( 1 );

		localStorage.setItem( 'key2', 'value2' );
		expect( localStorage.length ).toBe( 2 );

		localStorage.setItem( 'key3', 'value3' );
		localStorage.setItem( 'key4', 'value4' );
		expect( localStorage.length ).toBe( 4 );
	} );

	it( 'should return the correct length after items are added and removed', () => {
		localStorage.setItem( 'key1', 'value1' );
		localStorage.setItem( 'key2', 'value2' );
		localStorage.removeItem( 'key1' );
		expect( localStorage.length ).toBe( 1 );

		localStorage.setItem( 'key3', 'value3' );
		localStorage.setItem( 'key4', 'value4' );
		localStorage.removeItem( 'key3' );
		expect( localStorage.length ).toBe( 2 );
	} );
} );

describe( 'key', () => {
	it( 'should return null for any index if localStorage is empty', () => {
		expect( localStorage.key( 0 ) ).toBe( null );
		expect( localStorage.key( 5 ) ).toBe( null );
		expect( localStorage.key( 200 ) ).toBe( null );
		expect( localStorage.key( -1 ) ).toBe( null );
	} );

	it( 'should return the key at the given index if there are elements in localStorage', () => {
		localStorage.setItem( 'key1', 'value1' );
		localStorage.setItem( 'key2', 'value2' );
		expect( localStorage.key( 0 ) ).toBe( 'key1' );
		expect( localStorage.key( 1 ) ).toBe( 'key2' );
	} );

	it( 'should return null if there are elements in localStorage and the index is out of bounds', () => {
		localStorage.setItem( 'key1', 'value1' );
		localStorage.setItem( 'key2', 'value2' );
		expect( localStorage.key( 2 ) ).toBe( null );
		expect( localStorage.key( -1 ) ).toBe( null );
	} );
} );
