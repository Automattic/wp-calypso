import {
	getBlueskyProfileUrl,
	getProfileUrl,
	getTagFeedUrl,
	getThreadUrl,
	getTimelineUrl,
	isValidHashtag,
} from '../route';

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

describe( 'isValidHashtag', () => {
	it( 'accepts ASCII letters, digits, underscore', () => {
		expect( isValidHashtag( 'rust' ) ).toBe( true );
		expect( isValidHashtag( 'rust2024' ) ).toBe( true );
		expect( isValidHashtag( 'foo_bar' ) ).toBe( true );
	} );

	it( 'accepts Unicode letters and marks', () => {
		expect( isValidHashtag( '日本語' ) ).toBe( true );
		expect( isValidHashtag( 'café' ) ).toBe( true );
	} );

	it( 'rejects hyphens, dots, slashes, spaces', () => {
		expect( isValidHashtag( 'tag-with-hyphen' ) ).toBe( false );
		expect( isValidHashtag( 'tag.with.dot' ) ).toBe( false );
		expect( isValidHashtag( '../foo' ) ).toBe( false );
		expect( isValidHashtag( 'has space' ) ).toBe( false );
	} );

	it( 'rejects empty and 65-char tags', () => {
		expect( isValidHashtag( '' ) ).toBe( false );
		expect( isValidHashtag( 'a'.repeat( 65 ) ) ).toBe( false );
		expect( isValidHashtag( 'a'.repeat( 64 ) ) ).toBe( true );
	} );
} );

describe( 'getTagFeedUrl', () => {
	it( 'returns the in-app tag-feed path for a valid hashtag', () => {
		expect( getTagFeedUrl( 7, 'rust' ) ).toBe( '/reader/atmosphere/7/tag/rust' );
	} );

	it( 'lowercases and percent-encodes Unicode tags', () => {
		expect( getTagFeedUrl( 7, 'Rust' ) ).toBe( '/reader/atmosphere/7/tag/rust' );
		expect( getTagFeedUrl( 7, '日本語' ) ).toBe(
			'/reader/atmosphere/7/tag/' + encodeURIComponent( '日本語' )
		);
	} );

	it( 'strips a leading # before validating', () => {
		expect( getTagFeedUrl( 7, '#rust' ) ).toBe( '/reader/atmosphere/7/tag/rust' );
	} );

	it( 'returns null for malformed hashtags', () => {
		expect( getTagFeedUrl( 7, 'has spaces' ) ).toBeNull();
		expect( getTagFeedUrl( 7, '../foo' ) ).toBeNull();
		expect( getTagFeedUrl( 7, '' ) ).toBeNull();
		expect( getTagFeedUrl( 7, 'tag-with-hyphen' ) ).toBeNull();
	} );

	it( 'returns null on a 65-char hashtag', () => {
		expect( getTagFeedUrl( 7, 'a'.repeat( 65 ) ) ).toBeNull();
	} );

	it( 'returns null for invalid connection ids', () => {
		expect( getTagFeedUrl( 0, 'rust' ) ).toBeNull();
		expect( getTagFeedUrl( -1, 'rust' ) ).toBeNull();
		expect( getTagFeedUrl( Number.NaN, 'rust' ) ).toBeNull();
	} );
} );
