/** @format */
/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { getCSSLinkHtml, replaceTemplatePlaceholders } from '../utils';

describe( 'utils', () => {
	describe( 'replaceTemplatePlaceholders()', () => {
		test( 'should parse placeholders', () => {
			expect( replaceTemplatePlaceholders( 'Hi, {{Name}}!', { Name: 'Terry' } ) ).toEqual(
				'Hi, Terry!'
			);
			expect( replaceTemplatePlaceholders( 'Hi, {{Name}}!', { Name: '' } ) ).toEqual( 'Hi, !' );
			expect(
				replaceTemplatePlaceholders( 'Hi, {{Name}}. {{Name}} is {{Adjective}}!', {
					Name: 'Terry',
					Adjective: 'great',
				} )
			).toEqual( 'Hi, Terry. Terry is great!' );
		} );
		test( 'should return content when content is not a string and placeholder data not an object', () => {
			expect( replaceTemplatePlaceholders() ).toBeUndefined();
			expect( replaceTemplatePlaceholders( 123, { Name: 'Terry' } ) ).toEqual( 123 );
			expect( replaceTemplatePlaceholders( '{{Blah}}', undefined ) ).toEqual( '{{Blah}}' );
		} );
	} );

	describe( 'getCSSLinkHtml()', () => {
		test( 'should return css link markup', () => {
			expect( getCSSLinkHtml( 'http://a.b.c' ) ).toEqual(
				'<link type="text/css" media="all" rel="stylesheet" href="http://a.b.c" />'
			);
		} );
		test( 'should return empty string if no url is passed', () => {
			expect( getCSSLinkHtml() ).toEqual( '' );
		} );
	} );
} );
