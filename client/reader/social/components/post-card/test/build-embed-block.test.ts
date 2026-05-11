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
} );
