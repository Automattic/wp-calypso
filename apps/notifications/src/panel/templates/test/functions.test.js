/**
 * @jest-environment jsdom
 */
import { getLinkHtml } from '../functions';

describe( 'getLinkHtml', () => {
	// The result is rendered as HTML, and URL parsing keeps a quote in the host as is.
	it( 'keeps quotes in the URL and text from adding attributes or markup', () => {
		const url = 'https://a"onmouseover="x/p"q?r="s"#"t"';
		const container = document.createElement( 'div' );
		container.innerHTML = getLinkHtml( url, 'View <b>"it"</b>' );

		const link = container.querySelector( 'a' );
		expect( link.getAttributeNames() ).toEqual( [ 'target', 'href' ] );
		expect( link.getAttribute( 'href' ) ).toBe( url );
		expect( link.textContent ).toBe( 'View <b>"it"</b>' );
	} );

	it.each( [ 'javascript:alert(1)', undefined ] )( 'returns null for %p', ( url ) => {
		expect( getLinkHtml( url, 'View' ) ).toBeNull();
	} );
} );
