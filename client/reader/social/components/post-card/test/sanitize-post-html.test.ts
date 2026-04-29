/**
 * @jest-environment jsdom
 */
import { sanitizePostHtml } from '../sanitize-post-html';

describe( 'sanitizePostHtml', () => {
	it( 'preserves allowed tags (p, br, a)', () => {
		const html = '<p>hello <a href="https://example.com">there</a><br>world</p>';
		expect( sanitizePostHtml( html ) ).toBe( html );
	} );

	it( 'strips disallowed tags but keeps inner text', () => {
		expect( sanitizePostHtml( '<p>hi <script>alert(1)</script> bye</p>' ) ).toBe(
			'<p>hi  bye</p>'
		);
		expect( sanitizePostHtml( '<p><iframe src="x"></iframe>x</p>' ) ).toBe( '<p>x</p>' );
		expect( sanitizePostHtml( '<p><img src="x">y</p>' ) ).toBe( '<p>y</p>' );
	} );

	it( 'strips disallowed attributes', () => {
		const html = '<p>x <a href="https://example.com" onclick="evil()" style="color:red">y</a></p>';
		const out = sanitizePostHtml( html );
		expect( out ).not.toContain( 'onclick' );
		expect( out ).not.toContain( 'style' );
		expect( out ).toContain( 'href="https://example.com"' );
	} );

	it( 'strips javascript: URLs', () => {
		const out = sanitizePostHtml( '<p><a href="javascript:alert(1)">x</a></p>' );
		expect( out ).not.toContain( 'javascript:' );
	} );

	it( 'forces rel="nofollow noopener noreferrer" on target=_blank anchors', () => {
		const out = sanitizePostHtml( '<p><a href="https://x.example" target="_blank">x</a></p>' );
		expect( out ).toContain( 'rel="nofollow noopener noreferrer"' );
	} );

	it( 'preserves existing rel tokens on target=_blank anchors', () => {
		const out = sanitizePostHtml(
			'<p><a href="https://x.example" target="_blank" rel="me">x</a></p>'
		);
		expect( out ).toContain( 'me' );
		expect( out ).toContain( 'noopener' );
		expect( out ).toContain( 'noreferrer' );
	} );

	it( 'returns empty string for empty input', () => {
		expect( sanitizePostHtml( '' ) ).toBe( '' );
	} );
} );
