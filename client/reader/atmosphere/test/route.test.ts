import { getThreadUrl, getTimelineUrl } from '../route';

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
