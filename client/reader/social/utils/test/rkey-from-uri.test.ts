import { rkeyFromUri } from '../rkey-from-uri';

describe( 'rkeyFromUri', () => {
	it( 'extracts rkey from a typical at-uri', () => {
		expect( rkeyFromUri( 'at://did:plc:abc/app.bsky.feed.like/3kabcabcabcabc' ) ).toBe(
			'3kabcabcabcabc'
		);
	} );

	it( 'returns null for the pending sentinel', () => {
		expect( rkeyFromUri( '__pending_like__' ) ).toBeNull();
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
} );
