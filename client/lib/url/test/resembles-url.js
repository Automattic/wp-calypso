/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import resemblesUrl from '../resembles-url';

describe( 'resemblesUrl()', () => {
	test( 'should detect a URL', () => {
		const source = 'http://example.com/path';
		expect( resemblesUrl( source ) ).toBe( true );
	} );

	test( 'should detect a URL without protocol', () => {
		const source = 'example.com';
		expect( resemblesUrl( source ) ).toBe( true );
	} );

	test( 'should detect a URL with a query string', () => {
		const source = 'http://example.com/path?query=banana&query2=pineapple';
		expect( resemblesUrl( source ) ).toBe( true );
	} );

	test( 'should detect a URL with a short suffix', () => {
		const source = 'http://example.cc';
		expect( resemblesUrl( source ) ).toBe( true );
	} );

	test( 'should return false with adjacent dots', () => {
		const source = '..com';
		expect( resemblesUrl( source ) ).toBe( false );
	} );

	test( 'should return false with spaced dots', () => {
		const source = '. . .com';
		expect( resemblesUrl( source ) ).toBe( false );
	} );

	test( 'should return false with a single dot', () => {
		const source = '.';
		expect( resemblesUrl( source ) ).toBe( false );
	} );

	test( 'should return false if the string is not a URL', () => {
		const source = 'exampledotcom';
		expect( resemblesUrl( source ) ).toBe( false );
	} );
} );
