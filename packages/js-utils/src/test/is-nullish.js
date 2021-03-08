/**
 * Internal dependencies
 */
import isNullish from '../is-nullish';

describe( 'isNullish()', () => {
	test( 'should return false for false', () => {
		expect( isNullish( false ) ).toEqual( false );
	} );

	test( 'should return false for 0', () => {
		expect( isNullish( 0 ) ).toEqual( false );
	} );

	test( 'should return false for an empty object', () => {
		expect( isNullish( {} ) ).toEqual( false );
	} );

	test( 'should return false for an empty array', () => {
		expect( isNullish( [] ) ).toEqual( false );
	} );

	test( 'should return false for NaN', () => {
		expect( isNullish( NaN ) ).toEqual( false );
	} );

	test( 'should return true for undefined', () => {
		expect( isNullish( undefined ) ).toEqual( true );
	} );

	test( 'should return true for an undefined variable', () => {
		let a;
		expect( isNullish( a ) ).toEqual( true );
	} );

	test( 'should return true for a null', () => {
		expect( isNullish( null ) ).toEqual( true );
	} );

	test( 'should return true for void 0', () => {
		expect( isNullish( void 0 ) ).toEqual( true );
	} );
} );
