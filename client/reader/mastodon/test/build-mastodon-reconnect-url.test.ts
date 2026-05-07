import { buildMastodonReconnectUrl } from '../build-mastodon-reconnect-url';

describe( 'buildMastodonReconnectUrl', () => {
	it( 'points at the wpcom reconnect endpoint with the connection id', () => {
		const url = buildMastodonReconnectUrl( 42, '/reader/mastodon/42/timeline' );
		const parsed = new URL( url );
		expect( parsed.origin + parsed.pathname ).toBe(
			'https://public-api.wordpress.com/wpcom/v2/reader/mastodon/connections/42/reconnect'
		);
	} );

	it( 'encodes redirect_to with the reconnected marker appended', () => {
		const url = buildMastodonReconnectUrl( 42, '/reader/mastodon/42/timeline' );
		const parsed = new URL( url );
		const redirect = parsed.searchParams.get( 'redirect_to' );
		expect( redirect ).not.toBeNull();
		const redirectParsed = new URL( redirect as string, 'https://wordpress.com' );
		expect( redirectParsed.pathname ).toBe( '/reader/mastodon/42/timeline' );
		expect( redirectParsed.searchParams.get( 'reconnected' ) ).toBe( '42' );
	} );

	it( 'preserves existing query params on the return path', () => {
		const url = buildMastodonReconnectUrl( 42, '/reader/mastodon/42/timeline?tab=posts' );
		const parsed = new URL( url );
		const redirect = parsed.searchParams.get( 'redirect_to' );
		const redirectParsed = new URL( redirect as string, 'https://wordpress.com' );
		expect( redirectParsed.searchParams.get( 'tab' ) ).toBe( 'posts' );
		expect( redirectParsed.searchParams.get( 'reconnected' ) ).toBe( '42' );
	} );
} );
