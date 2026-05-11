import { readerFediverseKeys } from '../query-keys';

describe( 'readerFediverseKeys', () => {
	it( 'has a stable namespace root', () => {
		expect( readerFediverseKeys.all ).toEqual( [ 'reader', 'fediverse' ] );
	} );

	it( 'connections() returns a stable key', () => {
		expect( readerFediverseKeys.connections() ).toEqual( [ 'reader', 'fediverse', 'connections' ] );
	} );

	it( 'connection(id) keys by the connection id', () => {
		expect( readerFediverseKeys.connection( 42 ) ).toEqual( [
			'reader',
			'fediverse',
			'connection',
			42,
		] );
	} );

	it( 'connection(null) keeps the slot for cache parity', () => {
		expect( readerFediverseKeys.connection( null ) ).toEqual( [
			'reader',
			'fediverse',
			'connection',
			null,
		] );
	} );

	it( 'timeline(connectionId) keys by the connection id', () => {
		expect( readerFediverseKeys.timeline( 7 ) ).toEqual( [ 'reader', 'fediverse', 'timeline', 7 ] );
	} );

	it( 'authorProfile keys by connection id + actor', () => {
		expect( readerFediverseKeys.authorProfile( 7, 'alice@example.com' ) ).toEqual( [
			'reader',
			'fediverse',
			'profile',
			7,
			'alice@example.com',
		] );
	} );

	it( 'authorFeed keys by connection id + actor', () => {
		expect( readerFediverseKeys.authorFeed( 7, 'alice@example.com' ) ).toEqual( [
			'reader',
			'fediverse',
			'profile-feed',
			7,
			'alice@example.com',
		] );
	} );

	it( 'actorFollowers keys by connection id + actor', () => {
		expect( readerFediverseKeys.actorFollowers( 7, 'alice@example.com' ) ).toEqual( [
			'reader',
			'fediverse',
			'actor-followers',
			7,
			'alice@example.com',
		] );
	} );

	it( 'actorFollowing keys by connection id + actor', () => {
		expect( readerFediverseKeys.actorFollowing( 7, 'alice@example.com' ) ).toEqual( [
			'reader',
			'fediverse',
			'actor-following',
			7,
			'alice@example.com',
		] );
	} );
} );
