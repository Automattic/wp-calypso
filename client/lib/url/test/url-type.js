/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { determineUrlType } from '../url-type';

describe( 'determineUrlType', () => {
	test( 'should detect the correct type for absolute URLs', () => {
		expect( determineUrlType( 'http://example.com/' ) ).toBe( 'ABSOLUTE' );
		expect( determineUrlType( 'http://www.example.com' ) ).toBe( 'ABSOLUTE' );
		expect( determineUrlType( 'http://example.com/bar' ) ).toBe( 'ABSOLUTE' );
		expect( determineUrlType( 'http://example.com/bar?baz=1' ) ).toBe( 'ABSOLUTE' );
		expect( determineUrlType( new URL( 'http://example.com' ) ) ).toBe( 'ABSOLUTE' );
	} );

	test( 'should detect the correct type for protocol-relative URLs', () => {
		expect( determineUrlType( '//example.com/' ) ).toBe( 'PROTOCOL_RELATIVE' );
		expect( determineUrlType( '//www.example.com' ) ).toBe( 'PROTOCOL_RELATIVE' );
		expect( determineUrlType( '//example.com/bar' ) ).toBe( 'PROTOCOL_RELATIVE' );
		expect( determineUrlType( '//example.com/bar?baz=1' ) ).toBe( 'PROTOCOL_RELATIVE' );
	} );

	test( 'should detect the correct type for root-relative URLs', () => {
		expect( determineUrlType( '/' ) ).toBe( 'ROOT_RELATIVE' );
		expect( determineUrlType( '/bar' ) ).toBe( 'ROOT_RELATIVE' );
		expect( determineUrlType( '/bar?baz=1' ) ).toBe( 'ROOT_RELATIVE' );
	} );

	test( 'should detect the correct type for path-relative URLs', () => {
		expect( determineUrlType( '' ) ).toBe( 'PATH_RELATIVE' );
		expect( determineUrlType( 'bar' ) ).toBe( 'PATH_RELATIVE' );
		expect( determineUrlType( 'bar?baz=1' ) ).toBe( 'PATH_RELATIVE' );
	} );

	test( 'should detect the correct type for invalid URLs', () => {
		expect( determineUrlType( null ) ).toBe( 'INVALID' );
		expect( determineUrlType( 0 ) ).toBe( 'INVALID' );
		expect( determineUrlType( '///' ) ).toBe( 'INVALID' );
	} );
} );
