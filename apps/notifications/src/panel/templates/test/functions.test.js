import { getLinkHref } from '../functions';

describe( 'getLinkHref', () => {
	// The result goes into a hand-built `href="…"`, so a quote must never come back unescaped.
	it( 'returns an http(s) URL with quotes and angle brackets percent-encoded', () => {
		expect( getLinkHref( 'https://example.com/a"b<c>?q="x"#"y"' ) ).toBe(
			'https://example.com/a%22b%3Cc%3E?q=%22x%22#%22y%22'
		);
	} );

	it.each( [ 'javascript:alert(1)', undefined ] )( 'returns null for %p', ( url ) => {
		expect( getLinkHref( url ) ).toBeNull();
	} );
} );
