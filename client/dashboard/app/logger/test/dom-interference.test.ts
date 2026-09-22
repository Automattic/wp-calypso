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

	it( 'flags partial probe coverage on engines with undetectable built-in translation', () => {
		const userAgent = jest.spyOn( navigator, 'userAgent', 'get' );

		userAgent.mockReturnValue(
			'Mozilla/5.0 (Macintosh) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
		);
		expect( getDomInterferenceReport().tags.dom_probe_coverage ).toBe( 'full' );

		userAgent.mockReturnValue( 'Mozilla/5.0 (Macintosh; rv:130.0) Gecko/20100101 Firefox/130.0' );
		expect( getDomInterferenceReport().tags.dom_probe_coverage ).toBe( 'partial' );

		userAgent.mockReturnValue(
			'Mozilla/5.0 (Macintosh) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15'
		);
		expect( getDomInterferenceReport().tags.dom_probe_coverage ).toBe( 'partial' );

		userAgent.mockRestore();
	} );
} );
