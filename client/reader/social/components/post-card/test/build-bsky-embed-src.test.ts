import { buildBskyEmbedSrc } from '../build-bsky-embed-src';

describe( 'buildBskyEmbedSrc', () => {
	it( 'builds an embed URL from a canonical bsky.app post URL', () => {
		expect( buildBskyEmbedSrc( 'https://bsky.app/profile/jane.bsky.social/post/3kabc' ) ).toBe(
			'https://embed.bsky.app/static/embed.html?url=' +
				encodeURIComponent( 'https://bsky.app/profile/jane.bsky.social/post/3kabc' )
		);
	} );

	it( 'returns null for a non-bsky URL', () => {
		expect( buildBskyEmbedSrc( 'https://example.com/post/1' ) ).toBeNull();
	} );

	it( 'returns null for an empty string', () => {
		expect( buildBskyEmbedSrc( '' ) ).toBeNull();
	} );

	it( 'returns null for a malformed URL', () => {
		expect( buildBskyEmbedSrc( 'not a url' ) ).toBeNull();
	} );
} );
