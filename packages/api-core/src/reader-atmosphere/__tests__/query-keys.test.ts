import { readerAtmosphereKeys } from '../query-keys';

describe( 'readerAtmosphereKeys', () => {
	it( 'stable keys', () => {
		expect( readerAtmosphereKeys.all ).toEqual( [ 'reader', 'atmosphere' ] );
		expect( readerAtmosphereKeys.connections() ).toEqual( [
			'reader',
			'atmosphere',
			'connections',
		] );
		expect( readerAtmosphereKeys.connection( 42 ) ).toEqual( [
			'reader',
			'atmosphere',
			'connection',
			42,
		] );
	} );
} );

describe( 'readerAtmosphereKeys.profile', () => {
	it( 'returns a stable key shape keyed on actor', () => {
		expect( readerAtmosphereKeys.profile( 'alice.bsky.social' ) ).toEqual( [
			'reader',
			'atmosphere',
			'profile',
			'alice.bsky.social',
		] );
	} );

	it( 'differs between two actors', () => {
		expect( readerAtmosphereKeys.profile( 'a' ) ).not.toEqual(
			readerAtmosphereKeys.profile( 'b' )
		);
	} );
} );

describe( 'readerAtmosphereKeys.authorFeed', () => {
	it( 'returns a stable key shape keyed on actor', () => {
		expect( readerAtmosphereKeys.authorFeed( 'alice.bsky.social' ) ).toEqual( [
			'reader',
			'atmosphere',
			'author-feed',
			'alice.bsky.social',
		] );
	} );

	it( 'differs from the profile key for the same actor', () => {
		expect( readerAtmosphereKeys.authorFeed( 'alice' ) ).not.toEqual(
			readerAtmosphereKeys.profile( 'alice' )
		);
	} );

	it( 'preserves the 4-element key shape when filter is undefined', () => {
		expect( readerAtmosphereKeys.authorFeed( 'alice.bsky.social' ) ).toEqual( [
			'reader',
			'atmosphere',
			'author-feed',
			'alice.bsky.social',
		] );
	} );

	it( 'appends the filter as a fifth element when set', () => {
		expect( readerAtmosphereKeys.authorFeed( 'alice.bsky.social', 'posts_with_replies' ) ).toEqual(
			[ 'reader', 'atmosphere', 'author-feed', 'alice.bsky.social', 'posts_with_replies' ]
		);
	} );

	it( 'differs from the no-filter key for the same actor', () => {
		expect( readerAtmosphereKeys.authorFeed( 'alice.bsky.social' ) ).not.toEqual(
			readerAtmosphereKeys.authorFeed( 'alice.bsky.social', 'posts_with_media' )
		);
	} );

	it( 'differs across filter values for the same actor', () => {
		expect(
			readerAtmosphereKeys.authorFeed( 'alice.bsky.social', 'posts_no_replies' )
		).not.toEqual( readerAtmosphereKeys.authorFeed( 'alice.bsky.social', 'posts_with_replies' ) );
	} );
} );
