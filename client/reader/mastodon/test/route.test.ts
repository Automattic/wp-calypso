import { getProfileUrl } from '../route';

describe( 'getProfileUrl', () => {
	it( 'returns null on a non-positive connection id', () => {
		expect( getProfileUrl( 0, '108020' ) ).toBeNull();
		expect( getProfileUrl( -1, '108020' ) ).toBeNull();
	} );

	it( 'returns null on an empty actor', () => {
		expect( getProfileUrl( 7, '' ) ).toBeNull();
	} );

	it( 'builds /reader/mastodon/<id>/profile/<actor> for a numeric id', () => {
		expect( getProfileUrl( 7, '108020' ) ).toBe( '/reader/mastodon/7/profile/108020' );
	} );

	it( 'builds the URL for a webfinger handle', () => {
		expect( getProfileUrl( 7, '@alice@mastodon.social' ) ).toBe(
			'/reader/mastodon/7/profile/@alice@mastodon.social'
		);
	} );

	it( 'qualifies a bare local handle to the connection instance', () => {
		expect( getProfileUrl( 7, 'alice', { instance: 'mastodon.social' } ) ).toBe(
			'/reader/mastodon/7/profile/@alice@mastodon.social'
		);
	} );

	it( 'returns null on a malformed actor string', () => {
		expect( getProfileUrl( 7, 'has spaces' ) ).toBeNull();
	} );
} );
