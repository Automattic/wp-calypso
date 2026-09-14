import { buildEmbedBlock } from '../build-embed-block';

describe( 'buildEmbedBlock', () => {
	it( 'emits a core/embed block for an https URL', () => {
		expect( buildEmbedBlock( 'https://bsky.app/profile/foo.bsky.social/post/abc' ) ).toBe(
			[
				'<!-- wp:embed {"url":"https://bsky.app/profile/foo.bsky.social/post/abc"} -->',
				'<figure class="wp-block-embed"><div class="wp-block-embed__wrapper">',
				'https://bsky.app/profile/foo.bsky.social/post/abc',
				'</div></figure>',
				'<!-- /wp:embed -->',
			].join( '\n' )
		);
	} );

	it( 'emits a block for http URLs too', () => {
		expect( buildEmbedBlock( 'http://example.test/post' ) ).toContain(
			'"url":"http://example.test/post"'
		);
	} );

	it( 'returns an empty string for non-http(s) URLs', () => {
		expect( buildEmbedBlock( 'javascript:alert(1)' ) ).toBe( '' );
		expect( buildEmbedBlock( 'data:text/html,<script>alert(1)</script>' ) ).toBe( '' );
		expect( buildEmbedBlock( '' ) ).toBe( '' );
		expect( buildEmbedBlock( 'not-a-url' ) ).toBe( '' );
	} );

	it( 'refuses URLs that could close the wp:embed comment early', () => {
		expect( buildEmbedBlock( 'https://example.test/--><script>' ) ).toBe( '' );
		expect( buildEmbedBlock( 'https://example.test/<!--evil' ) ).toBe( '' );
	} );

	it( 'JSON-escapes the URL in the block header and HTML-escapes the figure body', () => {
		const out = buildEmbedBlock( 'https://example.test/path?a=1&b="2"' );
		expect( out ).toContain( '"url":"https://example.test/path?a=1&b=\\"2\\""' );
		expect( out ).toContain( 'https://example.test/path?a=1&amp;b="2"' );
	} );

	it( 'HTML-escapes stray angle brackets in the figure body', () => {
		const out = buildEmbedBlock( 'https://example.test/?x=<a>&y=>b' );
		expect( out ).toContain( '?x=&lt;a&gt;&amp;y=&gt;b' );
	} );
} );
