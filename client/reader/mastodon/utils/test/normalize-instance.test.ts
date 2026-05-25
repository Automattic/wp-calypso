import { normalizeInstance } from '../normalize-instance';

describe( 'normalizeInstance', () => {
	it( 'returns a bare host unchanged', () => {
		expect( normalizeInstance( 'mastodon.social' ) ).toBe( 'mastodon.social' );
	} );

	it( 'strips https:// scheme', () => {
		expect( normalizeInstance( 'https://mastodon.social' ) ).toBe( 'mastodon.social' );
	} );

	it( 'strips http:// scheme', () => {
		expect( normalizeInstance( 'http://mastodon.social' ) ).toBe( 'mastodon.social' );
	} );

	it( 'strips a trailing slash', () => {
		expect( normalizeInstance( 'https://mastodon.social/' ) ).toBe( 'mastodon.social' );
		expect( normalizeInstance( 'mastodon.social/' ) ).toBe( 'mastodon.social' );
	} );

	it( 'strips a profile path', () => {
		expect( normalizeInstance( 'https://mastodon.social/@user' ) ).toBe( 'mastodon.social' );
	} );

	it( 'strips an arbitrary path, query, and fragment', () => {
		expect( normalizeInstance( 'https://mastodon.social/explore?foo=bar#top' ) ).toBe(
			'mastodon.social'
		);
	} );

	it( 'extracts host from a full Mastodon handle (@user@host)', () => {
		expect( normalizeInstance( '@user@mastodon.social' ) ).toBe( 'mastodon.social' );
	} );

	it( 'extracts host from a handle without a leading @ (user@host)', () => {
		expect( normalizeInstance( 'user@mastodon.social' ) ).toBe( 'mastodon.social' );
	} );

	it( 'extracts host from a remote profile URL path', () => {
		expect( normalizeInstance( 'https://mastodon.social/@alice@example.com' ) ).toBe(
			'example.com'
		);
	} );

	it( 'lowercases the host', () => {
		expect( normalizeInstance( 'Mastodon.Social' ) ).toBe( 'mastodon.social' );
		expect( normalizeInstance( 'HTTPS://Mastodon.Social' ) ).toBe( 'mastodon.social' );
	} );

	it( 'trims surrounding whitespace', () => {
		expect( normalizeInstance( '   mastodon.social   ' ) ).toBe( 'mastodon.social' );
		expect( normalizeInstance( '  https://mastodon.social/  ' ) ).toBe( 'mastodon.social' );
	} );

	it( 'strips a trailing dot from the host', () => {
		expect( normalizeInstance( 'mastodon.social.' ) ).toBe( 'mastodon.social' );
	} );

	it.each( [
		[ 'fedi.instance.tld', 'fedi.instance.tld' ],
		[ 'https://fedi.instance.tld', 'fedi.instance.tld' ],
		[ 'https://fedi.instance.tld/', 'fedi.instance.tld' ],
		[ 'https://fedi.instance.tld/@user', 'fedi.instance.tld' ],
		[ 'https://fedi.instance.tld/web/timelines/home', 'fedi.instance.tld' ],
		[ '@user@fedi.instance.tld', 'fedi.instance.tld' ],
		[ 'user@fedi.instance.tld', 'fedi.instance.tld' ],
		[ 'Fedi.Instance.TLD', 'fedi.instance.tld' ],
		[ 'fedi.instance.tld:8443', 'fedi.instance.tld:8443' ],
		[ 'social.fedi.instance.tld', 'social.fedi.instance.tld' ],
	] )( 'normalizes subdomain host %s to %s', ( input, expected ) => {
		expect( normalizeInstance( input ) ).toBe( expected );
	} );

	it( 'preserves an explicit port', () => {
		expect( normalizeInstance( 'mastodon.social:8443' ) ).toBe( 'mastodon.social:8443' );
		expect( normalizeInstance( 'https://mastodon.social:8443' ) ).toBe( 'mastodon.social:8443' );
	} );

	it( 'passes through unsupported schemes for backend validation', () => {
		expect( normalizeInstance( 'ftp://mastodon.social' ) ).toBe( 'ftp://mastodon.social' );
		expect( normalizeInstance( 'javascript://mastodon.social/%0Aalert(1)' ) ).toBe(
			'javascript://mastodon.social/%0Aalert(1)'
		);
		expect( normalizeInstance( 'mailto:user@mastodon.social' ) ).toBe(
			'mailto:user@mastodon.social'
		);
	} );

	it( 'passes through explicit URLs with userinfo for backend validation', () => {
		expect( normalizeInstance( 'https://mastodon.social@evil.example' ) ).toBe(
			'https://mastodon.social@evil.example'
		);
	} );

	it( 'returns an empty string for empty input', () => {
		expect( normalizeInstance( '' ) ).toBe( '' );
		expect( normalizeInstance( '   ' ) ).toBe( '' );
	} );

	it( 'returns the trimmed input when it cannot be parsed', () => {
		// A space inside a hostname makes URL parsing throw. We pass it through
		// so the backend surfaces the usual `invalid_instance` error.
		expect( normalizeInstance( '  not a host  ' ) ).toBe( 'not a host' );
	} );
} );
