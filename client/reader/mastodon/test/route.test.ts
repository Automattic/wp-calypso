import {
	getFollowersUrl,
	getFollowingUrl,
	getProfileUrl,
	getThreadUrl,
	getTimelineUrl,
	isValidActor,
	getTagFeedUrl,
	isValidHashtag,
} from '../route';

describe( 'getTimelineUrl', () => {
	it( 'returns the connection-scoped timeline path', () => {
		expect( getTimelineUrl( 7 ) ).toBe( '/reader/mastodon/7/timeline' );
	} );
} );

describe( 'getThreadUrl', () => {
	it( 'returns null on a non-positive connection id', () => {
		expect( getThreadUrl( 0, '108020' ) ).toBeNull();
		expect( getThreadUrl( -1, '108020' ) ).toBeNull();
	} );

	it( 'returns null on a non-numeric status id', () => {
		expect( getThreadUrl( 7, 'abc' ) ).toBeNull();
		expect( getThreadUrl( 7, '' ) ).toBeNull();
	} );

	it( 'builds /reader/mastodon/<id>/thread/<statusId>', () => {
		expect( getThreadUrl( 7, '108020' ) ).toBe( '/reader/mastodon/7/thread/108020' );
	} );
} );

describe( 'isValidActor', () => {
	it( 'accepts numeric ids', () => {
		expect( isValidActor( '108020' ) ).toBe( true );
	} );

	it( 'accepts qualified webfinger handles with and without leading @', () => {
		expect( isValidActor( '@alice@mastodon.social' ) ).toBe( true );
		expect( isValidActor( 'alice@mastodon.social' ) ).toBe( true );
	} );

	it( 'accepts bare local handles with and without leading @', () => {
		expect( isValidActor( 'alice' ) ).toBe( true );
		expect( isValidActor( '@alice' ) ).toBe( true );
	} );

	it( 'rejects path traversal and control characters', () => {
		expect( isValidActor( '../../foo' ) ).toBe( false );
		expect( isValidActor( 'alice/extra' ) ).toBe( false );
		expect( isValidActor( 'has spaces' ) ).toBe( false );
		expect( isValidActor( 'a?b=c' ) ).toBe( false );
		expect( isValidActor( '' ) ).toBe( false );
	} );
} );

describe( 'getProfileUrl', () => {
	it( 'returns null on a non-positive connection id', () => {
		expect( getProfileUrl( 0, '108020' ) ).toBeNull();
		expect( getProfileUrl( -1, '108020' ) ).toBeNull();
	} );

	it( 'returns null on an empty actor', () => {
		expect( getProfileUrl( 7, '' ) ).toBeNull();
	} );

	it( 'returns null on a malformed actor', () => {
		expect( getProfileUrl( 7, '../../foo' ) ).toBeNull();
		expect( getProfileUrl( 7, 'has spaces' ) ).toBeNull();
		expect( getProfileUrl( 7, 'alice/x' ) ).toBeNull();
	} );

	it( 'builds /reader/mastodon/<id>/profile/<actor> for a numeric id', () => {
		expect( getProfileUrl( 7, '108020' ) ).toBe( '/reader/mastodon/7/profile/108020' );
	} );

	it( 'percent-encodes a webfinger handle', () => {
		expect( getProfileUrl( 7, '@alice@mastodon.social' ) ).toBe(
			'/reader/mastodon/7/profile/%40alice%40mastodon.social'
		);
	} );

	it( 'qualifies a bare local handle to the connection instance', () => {
		expect( getProfileUrl( 7, 'alice', { instance: 'mastodon.social' } ) ).toBe(
			'/reader/mastodon/7/profile/%40alice%40mastodon.social'
		);
	} );

	it( 'does not qualify a numeric account id even when instance is provided', () => {
		// A numeric id is already a valid actor shape; qualifying it would
		// synthesize a fake `@<id>@<instance>` handle that the backend's
		// webfinger resolver can't look up.
		expect( getProfileUrl( 7, '108020', { instance: 'mastodon.social' } ) ).toBe(
			'/reader/mastodon/7/profile/108020'
		);
	} );

	it( 'passes through an unqualified webfinger handle (no leading @)', () => {
		expect( getProfileUrl( 7, 'alice@mastodon.social' ) ).toBe(
			'/reader/mastodon/7/profile/alice%40mastodon.social'
		);
	} );
} );

describe( 'getFollowersUrl', () => {
	it( 'appends /followers to the profile URL', () => {
		expect( getFollowersUrl( 7, '@alice@mastodon.social' ) ).toBe(
			'/reader/mastodon/7/profile/%40alice%40mastodon.social/followers'
		);
	} );

	it( 'qualifies a bare local handle with the connection instance', () => {
		expect( getFollowersUrl( 7, 'alice', { instance: 'mastodon.social' } ) ).toBe(
			'/reader/mastodon/7/profile/%40alice%40mastodon.social/followers'
		);
	} );

	it( 'preserves a numeric account id when an instance is provided', () => {
		expect( getFollowersUrl( 7, '108020', { instance: 'mastodon.social' } ) ).toBe(
			'/reader/mastodon/7/profile/108020/followers'
		);
	} );

	it( 'returns null when the actor fails validation', () => {
		expect( getFollowersUrl( 7, '../../bad' ) ).toBeNull();
	} );
} );

describe( 'getFollowingUrl', () => {
	it( 'appends /following to the profile URL', () => {
		expect( getFollowingUrl( 7, '@alice@mastodon.social' ) ).toBe(
			'/reader/mastodon/7/profile/%40alice%40mastodon.social/following'
		);
	} );

	it( 'preserves a numeric account id when an instance is provided', () => {
		expect( getFollowingUrl( 7, '108020', { instance: 'mastodon.social' } ) ).toBe(
			'/reader/mastodon/7/profile/108020/following'
		);
	} );

	it( 'returns null when the connectionId is invalid', () => {
		expect( getFollowingUrl( 0, 'alice@mastodon.social' ) ).toBeNull();
	} );
} );

describe( 'isValidHashtag', () => {
	it( 'accepts canonical (lowercase) ASCII alphanumeric + underscore', () => {
		expect( isValidHashtag( 'rust' ) ).toBe( true );
		expect( isValidHashtag( 'rust_lang' ) ).toBe( true );
		expect( isValidHashtag( 'r2d2' ) ).toBe( true );
	} );

	it( 'rejects uppercase (canonical form is lowercase only)', () => {
		expect( isValidHashtag( 'Rust' ) ).toBe( false );
		expect( isValidHashtag( 'RUST' ) ).toBe( false );
	} );

	it( 'rejects path traversal, spaces, leading hash, and empty', () => {
		expect( isValidHashtag( 'rust/extra' ) ).toBe( false );
		expect( isValidHashtag( 'rust lang' ) ).toBe( false );
		expect( isValidHashtag( '#rust' ) ).toBe( false );
		expect( isValidHashtag( '' ) ).toBe( false );
		expect( isValidHashtag( '../etc' ) ).toBe( false );
	} );

	it( 'enforces the 128-char length cap', () => {
		expect( isValidHashtag( 'a'.repeat( 128 ) ) ).toBe( true );
		expect( isValidHashtag( 'a'.repeat( 129 ) ) ).toBe( false );
	} );
} );

describe( 'getTagFeedUrl', () => {
	it( 'returns null on a non-positive connection id', () => {
		expect( getTagFeedUrl( 0, 'rust' ) ).toBeNull();
		expect( getTagFeedUrl( -1, 'rust' ) ).toBeNull();
	} );

	it( 'lowercases the canonical hashtag and percent-encodes the segment', () => {
		expect( getTagFeedUrl( 7, 'Rust' ) ).toBe( '/reader/mastodon/7/tag/rust' );
	} );

	it( 'strips a leading # before validating', () => {
		expect( getTagFeedUrl( 7, '#rust' ) ).toBe( '/reader/mastodon/7/tag/rust' );
	} );

	it( 'returns null on a malformed hashtag', () => {
		expect( getTagFeedUrl( 7, 'has spaces' ) ).toBeNull();
		expect( getTagFeedUrl( 7, '../foo' ) ).toBeNull();
		expect( getTagFeedUrl( 7, '' ) ).toBeNull();
	} );
} );
