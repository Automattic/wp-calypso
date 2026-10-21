import { normalizeHandle } from '../normalize-handle';

describe( 'normalizeHandle', () => {
	it( 'strips a leading @ from a Mastodon-style handle', () => {
		expect( normalizeHandle( '@alice@mastodon.social' ) ).toBe( 'alice@mastodon.social' );
	} );

	it( 'leaves an ATproto-style handle untouched', () => {
		expect( normalizeHandle( 'alice.bsky.social' ) ).toBe( 'alice.bsky.social' );
	} );

	it( 'strips every leading @ so a malformed @@-prefixed handle does not double up after templating', () => {
		expect( normalizeHandle( '@@double' ) ).toBe( 'double' );
	} );

	it( 'collapses a bare @ to an empty string', () => {
		expect( normalizeHandle( '@' ) ).toBe( '' );
	} );

	it( 'leaves interior @s alone', () => {
		expect( normalizeHandle( 'a@b@c' ) ).toBe( 'a@b@c' );
	} );

	it( 'does not strip leading whitespace before an @', () => {
		expect( normalizeHandle( ' @user@instance' ) ).toBe( ' @user@instance' );
	} );

	it( 'returns an empty string for empty input', () => {
		expect( normalizeHandle( '' ) ).toBe( '' );
	} );
} );
