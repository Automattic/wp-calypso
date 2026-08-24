/**
 * @jest-environment jsdom
 */

import { getDomInterferenceReport } from '../dom-interference';

afterEach( () => {
	document.documentElement.className = '';
	document.documentElement.removeAttribute( 'lang' );
	document.body.innerHTML = '';
	document.body.removeAttribute( 'data-gr-ext-installed' );
} );

describe( 'getDomInterferenceReport', () => {
	it( 'reports no interference on a clean document', () => {
		const { tags } = getDomInterferenceReport();

		expect( tags.dom_google_translate ).toBe( 'false' );
		expect( tags.dom_ms_translate ).toBe( 'false' );
		expect( tags.dom_immersive_translate ).toBe( 'false' );
		expect( tags.dom_grammarly ).toBe( 'false' );
		expect( tags.dom_dark_reader ).toBe( 'false' );
	} );

	it( 'detects Google Translate via the html class', () => {
		document.documentElement.classList.add( 'translated-ltr' );

		expect( getDomInterferenceReport().tags.dom_google_translate ).toBe( 'true' );
	} );

	it( 'detects Edge translate via _msttexthash attributes', () => {
		document.body.innerHTML = '<span _msttexthash="123">Hello</span>';

		expect( getDomInterferenceReport().tags.dom_ms_translate ).toBe( 'true' );
	} );

	it( 'detects Grammarly', () => {
		document.body.setAttribute( 'data-gr-ext-installed', '' );

		expect( getDomInterferenceReport().tags.dom_grammarly ).toBe( 'true' );
	} );

	it( 'reports the document language and font count in the context', () => {
		document.documentElement.setAttribute( 'lang', 'es' );
		document.body.innerHTML = '<font>a</font><font>b</font>';

		const { tags, context } = getDomInterferenceReport();

		expect( tags.dom_doc_lang ).toBe( 'es' );
		expect( context.fontCount ).toBe( 2 );
	} );

	it( 'collects deduped custom-element tag names and caps attribute value length', () => {
		document.documentElement.setAttribute( 'data-long', 'x'.repeat( 200 ) );
		document.body.innerHTML = '<my-widget></my-widget><my-widget></my-widget><other-el></other-el>';

		const { context } = getDomInterferenceReport();

		expect( context.customElements ).toEqual(
			expect.arrayContaining( [ 'my-widget', 'other-el' ] )
		);
		expect(
			( context.customElements as string[] ).filter( ( n ) => n === 'my-widget' )
		).toHaveLength( 1 );
		expect(
			( context.documentElementAttributes as Record< string, string > )[ 'data-long' ]
		).toHaveLength( 100 );
	} );
} );
