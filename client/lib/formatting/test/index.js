/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { capitalPDangit, parseHtml, preventWidows } from '../index';

describe( 'formatting', () => {
	describe( '#capitalPDangtest()', function () {
		test( 'should error when input is not a string', function () {
			const types = [ {}, undefined, 1, true, [], function () {} ];

			types.forEach( function ( type ) {
				expect( function () {
					capitalPDangit( type );
				} ).toThrow( Error );
			} );
		} );

		test( 'should not modify wordpress', function () {
			const strings = [ 'wordpress', 'I love wordpress' ];

			strings.forEach( function ( string ) {
				expect( capitalPDangit( string ) ).toBe( string );
			} );
		} );

		test( 'should return WordPress with a capital P when passed Wordpress', function () {
			expect( capitalPDangit( 'Wordpress' ) ).toBe( 'WordPress' );
			expect( capitalPDangit( 'I love Wordpress' ) ).toBe( 'I love WordPress' );
		} );

		test( 'should replace all instances of Wordpress', function () {
			expect( capitalPDangit( 'Wordpress Wordpress' ) ).toBe( 'WordPress WordPress' );
			expect( capitalPDangit( 'I love Wordpress and Wordpress loves me' ) ).toBe(
				'I love WordPress and WordPress loves me'
			);
		} );
	} );

	describe( '#parseHtml()', function () {
		test( 'should equal to null when input is not a string', function () {
			const types = [ {}, undefined, 1, true, [], function () {} ];

			types.forEach( function ( type ) {
				expect( parseHtml( type ) ).toBeNull();
			} );
		} );

		test( 'should return a DOM element if you pass in DOM element', function () {
			const div = document.createElement( 'div' );
			expect( div ).toBe( parseHtml( div ) );
		} );

		test( 'should return a document fragment if we pass in a string', function () {
			const fragment = parseHtml( 'hello' );
			expect( typeof fragment.querySelector ).toBe( 'function' );
			expect( fragment.querySelectorAll( '*' ) ).toHaveLength( 0 );
		} );

		test( 'should return a document fragment if we pass in a HTML string', function () {
			const fragment = parseHtml( '<div>hello</div>' );
			expect( fragment.querySelectorAll( 'div' ) ).toHaveLength( 1 );
		} );

		test( 'should parseHtml and return document fragment that can be queried', function () {
			const strings = [
				'<span><a href="stuff">hello world</a></span>',
				'<div><span></span><a href="stuff">hello world</a></div>',
			];

			strings.forEach( function ( string ) {
				const link = parseHtml( string ).querySelectorAll( 'a' );
				expect( link[ 0 ].innerHTML ).toBe( 'hello world' );
			} );
		} );
	} );

	describe( '#preventWidows()', () => {
		test( 'should not modify input if type is not string', () => {
			const types = [ {}, undefined, 1, true, [], function () {} ];

			types.forEach( ( type ) => {
				expect( preventWidows( type ) ).toBe( type );
			} );
		} );

		test( 'should return empty string when input is all whitespace', () => {
			const inputs = [ ' ', '\t', '\n' ];

			inputs.forEach( ( input ) => {
				expect( preventWidows( input ) ).toBe( '' );
			} );
		} );

		test( 'should return input when only one word', () => {
			expect( preventWidows( 'test' ) ).toBe( 'test' );
		} );

		test( 'should trim whitespace', () => {
			expect( preventWidows( 'test ' ) ).toBe( 'test' );
			expect( preventWidows( '\ntest string ' ) ).toBe( 'test\xA0string' );
		} );

		test( 'should add non-breaking space between words to keep', () => {
			const input = 'I really love BBQ. It is one of my favorite foods. Beef ribs are amazing.';
			expect( preventWidows( input ) ).toBe(
				'I really love BBQ. It is one of my favorite foods. Beef ribs are\xA0amazing.'
			);
			expect( preventWidows( input, 4 ) ).toBe(
				'I really love BBQ. It is one of my favorite foods. Beef\xA0ribs\xA0are\xA0amazing.'
			);
		} );
	} );
} );
