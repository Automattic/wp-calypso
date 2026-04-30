import { getProfileUrl, getThreadUrl, getTimelineUrl, isValidActor } from '../route';

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

	it( 'passes through an unqualified webfinger handle (no leading @)', () => {
		expect( getProfileUrl( 7, 'alice@mastodon.social' ) ).toBe(
			'/reader/mastodon/7/profile/alice%40mastodon.social'
		);
	} );
} );
