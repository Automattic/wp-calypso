import { isWebUrl } from '../is-web-url';

describe( 'isWebUrl', () => {
	test( 'should return true for a valid http URL', () => {
		expect( isWebUrl( 'http://example.com' ) ).toBe( true );
	} );

	test( 'should return true for a valid https URL', () => {
		expect( isWebUrl( 'https://example.com' ) ).toBe( true );
	} );

	test( 'should return true for an https URL with a path and query string', () => {
		expect( isWebUrl( 'https://example.com/path?foo=bar' ) ).toBe( true );
	} );

	test( 'should return true for an http URL with a port', () => {
		expect( isWebUrl( 'http://example.com:8080' ) ).toBe( true );
	} );

	test( 'should return false for an ftp URL', () => {
		expect( isWebUrl( 'ftp://example.com' ) ).toBe( false );
	} );

	test( 'should return false for a mailto URL', () => {
		expect( isWebUrl( 'mailto:user@example.com' ) ).toBe( false );
	} );

	test( 'should return false for a javascript URL', () => {
		expect( isWebUrl( 'javascript:void(0)' ) ).toBe( false );
	} );

	test( 'should return false for a plain string with no protocol', () => {
		expect( isWebUrl( 'example.com' ) ).toBe( false );
	} );

	test( 'should return false for an empty string', () => {
		expect( isWebUrl( '' ) ).toBe( false );
	} );
} );
