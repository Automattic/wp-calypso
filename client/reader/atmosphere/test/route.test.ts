import { getBlueskyProfileUrl, getProfileUrl, getThreadUrl, getTimelineUrl } from '../route';

describe( 'getTimelineUrl', () => {
	it( 'returns the connection-scoped timeline path', () => {
		expect( getTimelineUrl( 7 ) ).toBe( '/reader/atmosphere/7/timeline' );
	} );
} );

describe( 'getThreadUrl', () => {
	it( 'returns the in-app thread URL for a valid Bluesky at-uri', () => {
		expect(
			getThreadUrl( 7, 'at://did:plc:abc234567defghi234567jkl/app.bsky.feed.post/3kabcdefghijk' )
		).toBe( '/reader/atmosphere/7/thread/did:plc:abc234567defghi234567jkl/3kabcdefghijk' );
	} );

	it( 'returns the URL for a did:web at-uri', () => {
		expect( getThreadUrl( 7, 'at://did:web:example.com/app.bsky.feed.post/3kabcdefghijk' ) ).toBe(
			'/reader/atmosphere/7/thread/did:web:example.com/3kabcdefghijk'
		);
	} );

	it( 'returns null for a non-Bluesky NSID', () => {
		expect(
			getThreadUrl( 7, 'at://did:plc:abc234567defghi234567jkl/app.bsky.actor.profile/self' )
		).toBeNull();
	} );

	it( 'returns null for a malformed at-uri', () => {
		expect( getThreadUrl( 7, 'at://garbage' ) ).toBeNull();
		expect( getThreadUrl( 7, 'https://bsky.app/profile/x/post/y' ) ).toBeNull();
		expect( getThreadUrl( 7, '' ) ).toBeNull();
	} );

	it( 'rejects did:web identifiers without a hostname-shaped tail', () => {
		expect( getThreadUrl( 7, 'at://did:web:./app.bsky.feed.post/3kabcdefghijk' ) ).toBeNull();
		expect( getThreadUrl( 7, 'at://did:web:foo/app.bsky.feed.post/3kabcdefghijk' ) ).toBeNull();
		expect( getThreadUrl( 7, 'at://did:web:.foo/app.bsky.feed.post/3kabcdefghijk' ) ).toBeNull();
		expect( getThreadUrl( 7, 'at://did:web:foo./app.bsky.feed.post/3kabcdefghijk' ) ).toBeNull();
		expect(
			getThreadUrl( 7, 'at://did:web:-foo.bar/app.bsky.feed.post/3kabcdefghijk' )
		).toBeNull();
	} );

	it( 'returns null for invalid connection ids', () => {
		expect(
			getThreadUrl( 0, 'at://did:plc:abc234567defghi234567jkl/app.bsky.feed.post/3kabcdefghijk' )
		).toBeNull();
	} );
} );

describe( 'getProfileUrl', () => {
	const VALID_DID = 'did:plc:abc234567defghi234567jkl';

	it( 'encodes a valid handle into the profile path, preferring it over DID', () => {
		expect( getProfileUrl( 7, { did: VALID_DID, handle: 'alice.bsky.social' } ) ).toBe(
			'/reader/atmosphere/7/profile/alice.bsky.social'
		);
	} );

	it( 'falls back to DID when handle is missing or invalid', () => {
		expect( getProfileUrl( 7, { did: VALID_DID } ) ).toBe(
			`/reader/atmosphere/7/profile/${ encodeURIComponent( VALID_DID ) }`
		);
		expect( getProfileUrl( 7, { handle: 'BAD UPPERCASE', did: VALID_DID } ) ).toBe(
			`/reader/atmosphere/7/profile/${ encodeURIComponent( VALID_DID ) }`
		);
	} );

	it( 'accepts did:web hostnames', () => {
		expect( getProfileUrl( 7, { did: 'did:web:example.com' } ) ).toBe(
			`/reader/atmosphere/7/profile/${ encodeURIComponent( 'did:web:example.com' ) }`
		);
	} );

	it( 'returns null when neither handle nor DID validates', () => {
		expect( getProfileUrl( 7, {} ) ).toBeNull();
		expect( getProfileUrl( 7, { handle: '', did: '' } ) ).toBeNull();
		expect( getProfileUrl( 7, { handle: '   ', did: '   ' } ) ).toBeNull();
		expect( getProfileUrl( 7, { handle: null, did: null } ) ).toBeNull();
	} );

	it( 'rejects malformed handles', () => {
		expect( getProfileUrl( 7, { handle: 'Alice.bsky.social' } ) ).toBeNull();
		expect( getProfileUrl( 7, { handle: '.alice.bsky.social' } ) ).toBeNull();
		expect( getProfileUrl( 7, { handle: 'alice' } ) ).toBeNull();
		expect( getProfileUrl( 7, { handle: 'alice.' } ) ).toBeNull();
	} );

	it( 'rejects malformed DIDs', () => {
		expect( getProfileUrl( 7, { did: 'did:plc:UPPERCASE234567defghi23' } ) ).toBeNull();
		expect( getProfileUrl( 7, { did: 'did:plc:short' } ) ).toBeNull();
		expect( getProfileUrl( 7, { did: 'did:web:.' } ) ).toBeNull();
	} );

	it( 'returns null for invalid connection ids', () => {
		expect( getProfileUrl( 0, { handle: 'alice.bsky.social' } ) ).toBeNull();
		expect( getProfileUrl( -1, { handle: 'alice.bsky.social' } ) ).toBeNull();
		expect( getProfileUrl( Number.NaN, { handle: 'alice.bsky.social' } ) ).toBeNull();
	} );
} );

describe( 'getBlueskyProfileUrl', () => {
	it( 'encodes the handle into the bsky.app profile URL', () => {
		expect( getBlueskyProfileUrl( 'alice.bsky.social' ) ).toBe(
			'https://bsky.app/profile/alice.bsky.social'
		);
	} );

	it( 'percent-encodes characters that would otherwise mangle the path', () => {
		expect( getBlueskyProfileUrl( 'foo/bar' ) ).toBe( 'https://bsky.app/profile/foo%2Fbar' );
		expect( getBlueskyProfileUrl( 'a?b' ) ).toBe( 'https://bsky.app/profile/a%3Fb' );
	} );
} );
