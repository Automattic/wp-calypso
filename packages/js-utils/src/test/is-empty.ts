import { runInNewContext } from 'vm';
import isEmpty from '../is-empty';

describe( 'isEmpty', () => {
	it( 'treats null and undefined as empty', () => {
		expect( isEmpty( null ) ).toBe( true );
		expect( isEmpty( undefined ) ).toBe( true );
	} );

	it( 'measures strings by length', () => {
		expect( isEmpty( '' ) ).toBe( true );
		expect( isEmpty( 'a' ) ).toBe( false );
	} );

	it( 'measures arrays by length', () => {
		expect( isEmpty( [] ) ).toBe( true );
		expect( isEmpty( [ 1 ] ) ).toBe( false );
	} );

	it( 'measures plain objects by own enumerable keys', () => {
		expect( isEmpty( {} ) ).toBe( true );
		expect( isEmpty( { a: 1 } ) ).toBe( false );
	} );

	it( 'treats a plain object that merely owns a length as non-empty', () => {
		expect( isEmpty( { length: 0 } ) ).toBe( false );
		expect( isEmpty( { length: 5 } ) ).toBe( false );
	} );

	it( 'ignores inherited (non-own) properties', () => {
		expect( isEmpty( Object.create( { a: 1 } ) ) ).toBe( true );
	} );

	it( 'measures Map and Set by size', () => {
		expect( isEmpty( new Map() ) ).toBe( true );
		expect( isEmpty( new Map( [ [ 1, 2 ] ] ) ) ).toBe( false );
		expect( isEmpty( new Set() ) ).toBe( true );
		expect( isEmpty( new Set( [ 1 ] ) ) ).toBe( false );
	} );

	it( 'measures typed arrays by length', () => {
		expect( isEmpty( new Uint8Array( 0 ) ) ).toBe( true );
		expect( isEmpty( new Uint8Array( 3 ) ) ).toBe( false );
	} );

	it( 'treats primitives as empty (they have no own enumerable keys)', () => {
		expect( isEmpty( 0 ) ).toBe( true );
		expect( isEmpty( 1 ) ).toBe( true );
		expect( isEmpty( NaN ) ).toBe( true );
		expect( isEmpty( true ) ).toBe( true );
		expect( isEmpty( false ) ).toBe( true );
		expect( isEmpty( Symbol( 'x' ) ) ).toBe( true );
	} );

	it( 'treats key-less built-ins and functions as empty', () => {
		expect( isEmpty( /ab/ ) ).toBe( true );
		expect( isEmpty( new Date() ) ).toBe( true );
		expect( isEmpty( () => {} ) ).toBe( true );
	} );

	it( 'measures jQuery-like array-likes (splice method + valid length) by length', () => {
		expect( isEmpty( { length: 0, splice() {} } ) ).toBe( true );
		expect( isEmpty( { length: 2, splice() {} } ) ).toBe( false );
	} );

	it( 'does not treat splice-or-length-only objects as array-like', () => {
		expect( isEmpty( { splice() {} } ) ).toBe( false );
		expect( isEmpty( { length: -1, splice() {} } ) ).toBe( false );
		expect( isEmpty( { length: 1.5, splice() {} } ) ).toBe( false );
	} );

	it( 'ignores a spoofed Symbol.toStringTag', () => {
		// A plain object masquerading as a Map is measured by its own keys, not size.
		expect( isEmpty( { [ Symbol.toStringTag ]: 'Map', size: 0, a: 1 } ) ).toBe( false );
		expect( isEmpty( { [ Symbol.toStringTag ]: 'Map' } ) ).toBe( true );
	} );

	it( 'measures Map and Set created in another realm (tag-based, not instanceof)', () => {
		const emptyMap = runInNewContext( 'new Map()' );
		const filledMap = runInNewContext( 'new Map( [ [ 1, 2 ] ] )' );
		const emptySet = runInNewContext( 'new Set()' );
		const filledSet = runInNewContext( 'new Set( [ 1 ] )' );
		expect( isEmpty( emptyMap ) ).toBe( true );
		expect( isEmpty( filledMap ) ).toBe( false );
		expect( isEmpty( emptySet ) ).toBe( true );
		expect( isEmpty( filledSet ) ).toBe( false );
	} );

	it( 'measures an arguments object by length', () => {
		/* eslint-disable prefer-rest-params -- exercising the `arguments`-object branch */
		const empty = ( function () {
			return arguments;
		} )();
		const filled = ( function () {
			return arguments;
		} )( 1, 2 );
		/* eslint-enable prefer-rest-params */
		expect( isEmpty( empty ) ).toBe( true );
		expect( isEmpty( filled ) ).toBe( false );
	} );
} );
