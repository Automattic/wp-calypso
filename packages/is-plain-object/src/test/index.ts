/**
 * Internal dependencies
 */
import isPlainObject from '../';

describe( 'isPlainObject', () => {
	test( 'should return true for plain objects', () => {
		expect( isPlainObject( { foo: 'bar' } ) ).toBe( true );
		expect( isPlainObject( new Object() ) ).toBe( true );
		expect( isPlainObject( Object.prototype ) ).toBe( true );
		expect( isPlainObject( Object.create( Object.prototype ) ) ).toBe( true );
		expect( isPlainObject( Object.create( null ) ) ).toBe( true );
	} );

	test( 'should return false for anything else', () => {
		expect( isPlainObject( undefined ) ).toBe( false );
		expect( isPlainObject( null ) ).toBe( false );
		expect( isPlainObject( true ) ).toBe( false );
		expect( isPlainObject( [ 1, 2, 3 ] ) ).toBe( false );
		expect( isPlainObject( '' ) ).toBe( false );
		expect( isPlainObject( 5 ) ).toBe( false );
		expect( isPlainObject( NaN ) ).toBe( false );
		expect( isPlainObject( Infinity ) ).toBe( false );
		// eslint-disable-next-line @typescript-eslint/no-array-constructor
		expect( isPlainObject( new Array() ) ).toBe( false );
		expect( isPlainObject( new String( '' ) ) ).toBe( false );
		expect( isPlainObject( new Number( 5 ) ) ).toBe( false );
		expect( isPlainObject( /someRegex/ ) ).toBe( false );
		expect( isPlainObject( new Set( [ 1, 2, 3 ] ) ) ).toBe( false );
		/* eslint-disable @typescript-eslint/no-empty-function */
		expect( isPlainObject( function () {} ) ).toBe( false );
		expect( isPlainObject( () => {} ) ).toBe( false );
		/* eslint-enable @typescript-eslint/no-empty-function */
		expect(
			isPlainObject(
				new ( function () {
					return this;
				} )()
			)
		).toBe( false );
	} );
} );
