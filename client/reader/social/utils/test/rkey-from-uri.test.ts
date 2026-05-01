import { PENDING_LIKE_URI } from '@automattic/api-core';
import { rkeyFromUri } from '../rkey-from-uri';

describe( 'rkeyFromUri', () => {
	it( 'extracts rkey from a typical at-uri', () => {
		expect( rkeyFromUri( 'at://did:plc:abc/app.bsky.feed.like/3krkeyrkeyrke' ) ).toBe(
			'3krkeyrkeyrke'
		);
	} );

	it( 'returns null for the pending sentinel', () => {
		expect( rkeyFromUri( PENDING_LIKE_URI ) ).toBeNull();
	} );

	it( 'returns null for an at-uri without an rkey segment', () => {
		expect( rkeyFromUri( 'at://did:plc:abc/app.bsky.feed.like' ) ).toBeNull();
	} );

	it( 'returns null for a non-at-uri input', () => {
		expect( rkeyFromUri( 'https://example.com' ) ).toBeNull();
	} );

	it( 'returns null for empty input', () => {
		expect( rkeyFromUri( '' ) ).toBeNull();
	} );

	it( 'returns null for an at-uri with a trailing-slash empty rkey', () => {
		expect( rkeyFromUri( 'at://did:plc:abc/app.bsky.feed.like/' ) ).toBeNull();
	} );
} );
