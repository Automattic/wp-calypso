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

	it( 'notifications(connectionId) returns a connection-scoped key', () => {
		expect( readerAtmosphereKeys.notifications( 42 ) ).toEqual( [
			'reader',
			'atmosphere',
			'notifications',
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

describe( 'readerAtmosphereKeys.scopedThread', () => {
	const URI = 'at://did:plc:abc/app.bsky.feed.post/3kabc';

	it( 'returns a stable key shape keyed on connectionId and uri', () => {
		expect( readerAtmosphereKeys.scopedThread( 42, URI ) ).toEqual( [
			'reader',
			'atmosphere',
			'scoped-thread',
			42,
			URI,
		] );
	} );

	it( 'differs from the public thread key for the same uri', () => {
		expect( readerAtmosphereKeys.scopedThread( 42, URI ) ).not.toEqual(
			readerAtmosphereKeys.thread( URI )
		);
	} );

	it( 'differs across connections for the same uri', () => {
		expect( readerAtmosphereKeys.scopedThread( 1, URI ) ).not.toEqual(
			readerAtmosphereKeys.scopedThread( 2, URI )
		);
	} );
} );

describe( 'readerAtmosphereKeys.scopedAuthorFeed', () => {
	it( 'returns a stable 5-element key shape when filter is undefined', () => {
		expect( readerAtmosphereKeys.scopedAuthorFeed( 42, 'alice.bsky.social' ) ).toEqual( [
			'reader',
			'atmosphere',
			'scoped-author-feed',
			42,
			'alice.bsky.social',
		] );
	} );

	it( 'appends the filter as a sixth element when set', () => {
		expect(
			readerAtmosphereKeys.scopedAuthorFeed( 42, 'alice.bsky.social', 'posts_with_replies' )
		).toEqual( [
			'reader',
			'atmosphere',
			'scoped-author-feed',
			42,
			'alice.bsky.social',
			'posts_with_replies',
		] );
	} );

	it( 'differs from the public author-feed key for the same actor + filter', () => {
		expect(
			readerAtmosphereKeys.scopedAuthorFeed( 42, 'alice.bsky.social', 'posts_with_media' )
		).not.toEqual( readerAtmosphereKeys.authorFeed( 'alice.bsky.social', 'posts_with_media' ) );
	} );

	it( 'differs across connections for the same actor', () => {
		expect( readerAtmosphereKeys.scopedAuthorFeed( 1, 'alice.bsky.social' ) ).not.toEqual(
			readerAtmosphereKeys.scopedAuthorFeed( 2, 'alice.bsky.social' )
		);
	} );

	it( 'differs across filter values for the same connection + actor', () => {
		expect(
			readerAtmosphereKeys.scopedAuthorFeed( 42, 'alice.bsky.social', 'posts_no_replies' )
		).not.toEqual(
			readerAtmosphereKeys.scopedAuthorFeed( 42, 'alice.bsky.social', 'posts_with_replies' )
		);
	} );
} );
