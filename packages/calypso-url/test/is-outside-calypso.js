/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import isOutsideCalypso from '../is-outside-calypso';

describe( 'isOutsideCalypso', () => {
	test( 'should return true for support site without trailing slash', () => {
		const source = 'https://example.com/support';
		const actual = isOutsideCalypso( source );
		expect( actual ).toBe( true );
	} );

	test( 'should return true for support site with trailing slash', () => {
		const source = 'http://example.com/support/';
		const actual = isOutsideCalypso( source );
		expect( actual ).toBe( true );
	} );

	test( 'should return true for support site page', () => {
		const source = 'http://example.com/support/test/';
		const actual = isOutsideCalypso( source );
		expect( actual ).toBe( true );
	} );

	test( 'should return true for locale specific support site without trailing slash', () => {
		const source = 'http://example.com/br/support';
		const actual = isOutsideCalypso( source );
		expect( actual ).toBe( true );
	} );

	test( 'should return true for locale specific support site with trailing slash', () => {
		const source = 'http://example.com/br/support/';
		const actual = isOutsideCalypso( source );
		expect( actual ).toBe( true );
	} );

	test( 'should return true for locale specific support site page', () => {
		const source = 'http://example.com/br/support/test/';
		const actual = isOutsideCalypso( source );
		expect( actual ).toBe( true );
	} );

	test( 'should return true for hyphenated locale specific support site without trailing slash', () => {
		const source = 'http://example.com/pt-br/support';
		const actual = isOutsideCalypso( source );
		expect( actual ).toBe( true );
	} );

	test( 'should return true for hyphenated locale specific support site with trailing slash', () => {
		const source = 'http://example.com/pt-br/support/';
		const actual = isOutsideCalypso( source );
		expect( actual ).toBe( true );
	} );

	test( 'should return true for hyphenated locale specific support site page', () => {
		const source = 'http://example.com/pt-br/support/test/';
		const actual = isOutsideCalypso( source );
		expect( actual ).toBe( true );
	} );

	test( 'should return true for forums site without trailing slash', () => {
		const source = 'https://example.com/forums';
		const actual = isOutsideCalypso( source );
		expect( actual ).toBe( true );
	} );

	test( 'should return true for forums site with trailing slash', () => {
		const source = 'http://example.com/forums/';
		const actual = isOutsideCalypso( source );
		expect( actual ).toBe( true );
	} );

	test( 'should return true for forums site page', () => {
		const source = 'http://example.com/forums/test/';
		const actual = isOutsideCalypso( source );
		expect( actual ).toBe( true );
	} );

	test( 'should return true for locale specific forums site without trailing slash', () => {
		const source = 'http://example.com/br/forums';
		const actual = isOutsideCalypso( source );
		expect( actual ).toBe( true );
	} );

	test( 'should return true for locale specific forums site with trailing slash', () => {
		const source = 'http://example.com/br/forums/';
		const actual = isOutsideCalypso( source );
		expect( actual ).toBe( true );
	} );

	test( 'should return true for locale specific forums site page', () => {
		const source = 'http://example.com/br/forums/test/';
		const actual = isOutsideCalypso( source );
		expect( actual ).toBe( true );
	} );

	test( 'should return true for hyphenated locale specific forums site without trailing slash', () => {
		const source = 'http://example.com/pt-br/forums';
		const actual = isOutsideCalypso( source );
		expect( actual ).toBe( true );
	} );

	test( 'should return true for hyphenated locale specific forums site with trailing slash', () => {
		const source = 'http://example.com/pt-br/forums/';
		const actual = isOutsideCalypso( source );
		expect( actual ).toBe( true );
	} );

	test( 'should return true for hyphenated locale specific forums site page', () => {
		const source = 'http://example.com/pt-br/forums/test/';
		const actual = isOutsideCalypso( source );
		expect( actual ).toBe( true );
	} );

	test( 'should return false for support site with invalid locale', () => {
		const source = 'https://example.com/brr/support';
		const actual = isOutsideCalypso( source );
		expect( actual ).toBe( false );
	} );

	test( 'should return false for support site with invalid hyphenated locale', () => {
		const source = 'https://example.com/pt-brr/support';
		const actual = isOutsideCalypso( source );
		expect( actual ).toBe( false );
	} );

	test( 'should return false for support site with invalid hyphenated locale 2', () => {
		const source = 'https://example.com/ptt-br/support';
		const actual = isOutsideCalypso( source );
		expect( actual ).toBe( false );
	} );

	test( 'should return false for support site with invalid double hyphenated locale', () => {
		const source = 'https://example.com/pt--br/support';
		const actual = isOutsideCalypso( source );
		expect( actual ).toBe( false );
	} );

	test( 'should return false for support site with locale and missing slash', () => {
		const source = 'https://example.com/brsupport';
		const actual = isOutsideCalypso( source );
		expect( actual ).toBe( false );
	} );

	test( 'should return false for support site with locale and hyphenated locale', () => {
		const source = 'https://example.com/br/pt-br/support';
		const actual = isOutsideCalypso( source );
		expect( actual ).toBe( false );
	} );
} );
