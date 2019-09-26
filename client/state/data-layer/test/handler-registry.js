/**
 * Internal dependencies
 */
import { getHandlers, registerHandlers, testReset } from '../handler-registry';

describe( 'handler loading', () => {
	beforeAll( testReset );

	test( 'should not return anything on init', () => {
		expect( getHandlers( 'foo' ) ).toBeFalsy();
	} );

	test( 'should return handlers when loaded by type', () => {
		registerHandlers( 'birthday', { BIRTHDAY: [ () => 5 ] } );

		expect( getHandlers( 'BIRTHDAY' )[ 0 ]() ).toEqual( 5 );
	} );

	test( 'should not return anything if no handlers associated to action type', () => {
		registerHandlers( 'birthday', { BIRTHDAY: [ () => 5 ] } );

		expect( getHandlers( 'SHAMROCK' ) ).toBeFalsy();
	} );

	test( 'should only load handler sets once', () => {
		registerHandlers( 'birthday', { BIRTHDAY: [ () => 5 ] } );
		registerHandlers( 'birthday', { BIRTHDAY: [ () => 7 ] } );

		const handlers = getHandlers( 'BIRTHDAY' );

		expect( handlers ).toHaveLength( 1 );
		expect( handlers[ 0 ]() ).toEqual( 5 );
	} );

	test( 'should merge lists for different handler sets', () => {
		registerHandlers( 'birthday', { BIRTHDAY: [ () => 5 ] } );
		registerHandlers( 'shamrock', { BIRTHDAY: [ () => 7 ] } );

		const handlers = getHandlers( 'BIRTHDAY' );

		expect( handlers ).toHaveLength( 2 );
		expect( [ handlers[ 0 ](), handlers[ 1 ]() ] ).toEqual( expect.arrayContaining( [ 5, 7 ] ) );
	} );
} );
