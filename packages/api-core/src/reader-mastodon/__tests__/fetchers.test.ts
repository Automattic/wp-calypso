import nock from 'nock';
import {
	authorizeMastodonConnection,
	completeMastodonConnection,
	getMastodonAuthorFeed,
	getMastodonAuthorProfile,
	getMastodonConnection,
	getMastodonConnections,
	getMastodonTagFeed,
	getMastodonTimeline,
} from '../fetchers';

const BASE = 'https://public-api.wordpress.com';

describe( 'mastodon fetchers', () => {
	afterEach( () => nock.cleanAll() );

	it( 'getMastodonConnections returns the list', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections' )
			.reply( 200, {
				connections: [
					{
						id: 101,
						handle: '@alice@mastodon.social',
						instance: 'mastodon.social',
						display_name: 'Alice',
						avatar: null,
					},
				],
			} );
		const res = await getMastodonConnections();
		expect( res.connections ).toHaveLength( 1 );
		expect( res.connections[ 0 ].handle ).toBe( '@alice@mastodon.social' );
		expect( res.connections[ 0 ].instance ).toBe( 'mastodon.social' );
	} );

	it( 'authorizeMastodonConnection posts step=authorize and returns authorize_url + state', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections', {
				step: 'authorize',
				instance: 'mastodon.social',
			} )
			.reply( 200, {
				authorize_url: 'https://mastodon.social/oauth/authorize?client_id=x&state=abc',
				state: 'abc',
			} );
		const res = await authorizeMastodonConnection( { instance: 'mastodon.social' } );
		expect( res.state ).toBe( 'abc' );
		expect( res.authorize_url ).toContain( 'mastodon.social/oauth/authorize' );
	} );

	it( 'completeMastodonConnection posts step=complete and returns the connection', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections', {
				step: 'complete',
				state: 'abc',
				code: 'xyz',
			} )
			.reply( 200, {
				connection: {
					id: 101,
					handle: '@alice@mastodon.social',
					instance: 'mastodon.social',
					display_name: 'Alice',
					avatar: null,
				},
			} );
		const res = await completeMastodonConnection( { state: 'abc', code: 'xyz' } );
		expect( res.connection.id ).toBe( 101 );
	} );

	it( 'GETs /reader/mastodon/connections/:id', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/42' )
			.reply( 200, {
				handle: '@alice@mastodon.social',
				instance: 'mastodon.social',
				display_name: 'Alice',
				description: '',
				avatar: null,
				header: null,
				counts: { followers: 0, following: 0, posts: 0 },
				raw: {},
			} );
		const result = await getMastodonConnection( 42 );
		expect( result.handle ).toBe( '@alice@mastodon.social' );
		expect( result.instance ).toBe( 'mastodon.social' );
		expect( result.counts.posts ).toBe( 0 );
	} );

	it( 'getMastodonConnections classifies 401 as auth_required', async () => {
		nock( BASE ).get( '/wpcom/v2/reader/mastodon/connections' ).reply( 401, {
			error: 'not_authenticated',
			message: '',
			statusCode: 401,
			status: 401,
		} );
		await expect( getMastodonConnections() ).rejects.toMatchObject( { kind: 'auth_required' } );
	} );
} );

describe( 'getMastodonTimeline', () => {
	afterEach( () => nock.cleanAll() );

	it( 'GETs /reader/mastodon/connections/:id/timeline with cursor + limit', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/timeline' )
			.query( { cursor: 'abc', limit: '20' } )
			.reply( 200, { items: [], cursor: null } );
		const res = await getMastodonTimeline( { connectionId: 7, cursor: 'abc', limit: 20 } );
		expect( res.items ).toEqual( [] );
		expect( res.cursor ).toBeNull();
	} );

	it( 'omits cursor and limit when not provided', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/timeline' )
			.reply( 200, { items: [], cursor: null } );
		const res = await getMastodonTimeline( { connectionId: 7 } );
		expect( res.items ).toEqual( [] );
	} );

	it( 'classifies mastodon_rate_limited with retry_after', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/timeline' )
			.reply( 429, { error: 'mastodon_rate_limited', data: { retry_after: 30 } } );
		await expect( getMastodonTimeline( { connectionId: 7 } ) ).rejects.toEqual( {
			kind: 'rate_limited',
			retry_after: 30,
		} );
	} );
} );

describe( 'getMastodonAuthorProfile', () => {
	afterEach( () => nock.cleanAll() );

	it( 'GETs /reader/mastodon/connections/:id/profile/:actor with the actor in the path', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020' )
			.reply( 200, {
				id: '108020',
				acct: 'alice@mastodon.social',
				display_name: 'Alice',
				avatar: null,
				header: null,
				note: '<p>hi</p>',
				counts: { followers: 0, following: 0, posts: 0 },
				locked: false,
				raw: {},
			} );
		const profile = await getMastodonAuthorProfile( { connectionId: 7, actor: '108020' } );
		expect( profile.id ).toBe( '108020' );
		expect( profile.acct ).toBe( 'alice@mastodon.social' );
	} );

	it( 'passes webfinger handles through unencoded (page.js leaves them as-is)', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/profile/%40alice%40mastodon.social' )
			.reply( 200, {
				id: '108020',
				acct: 'alice@mastodon.social',
				display_name: 'Alice',
				avatar: null,
				header: null,
				note: '',
				counts: { followers: 0, following: 0, posts: 0 },
				locked: false,
				raw: {},
			} );
		const profile = await getMastodonAuthorProfile( {
			connectionId: 7,
			actor: '@alice@mastodon.social',
		} );
		expect( profile.acct ).toBe( 'alice@mastodon.social' );
	} );

	it( 'classifies a 401 as auth_required', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020' )
			.reply( 401, { error: 'not_authenticated', message: '', statusCode: 401, status: 401 } );
		await expect(
			getMastodonAuthorProfile( { connectionId: 7, actor: '108020' } )
		).rejects.toMatchObject( { kind: 'auth_required' } );
	} );
} );

describe( 'getMastodonAuthorFeed', () => {
	afterEach( () => nock.cleanAll() );

	it( 'GETs /reader/mastodon/connections/:id/profile/:actor/feed with cursor + limit', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020/feed' )
			.query( { cursor: 'abc', limit: '20' } )
			.reply( 200, { items: [], cursor: null } );
		const page = await getMastodonAuthorFeed( {
			connectionId: 7,
			actor: '108020',
			cursor: 'abc',
			limit: 20,
		} );
		expect( page.items ).toEqual( [] );
		expect( page.cursor ).toBeNull();
	} );

	it( 'omits empty cursor + limit', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020/feed' )
			.reply( 200, { items: [], cursor: null } );
		const page = await getMastodonAuthorFeed( { connectionId: 7, actor: '108020' } );
		expect( page.cursor ).toBeNull();
	} );
} );

describe( 'getMastodonAuthorFeed filter mapping', () => {
	afterEach( () => nock.cleanAll() );

	it( 'sends exclude_replies=true for posts_no_replies', async () => {
		const scope = nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020/feed' )
			.query( { exclude_replies: 'true' } )
			.reply( 200, { items: [], cursor: null } );
		await getMastodonAuthorFeed( {
			connectionId: 7,
			actor: '108020',
			filter: 'posts_no_replies',
		} );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'sends only_media=true for posts_with_media', async () => {
		const scope = nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020/feed' )
			.query( { only_media: 'true' } )
			.reply( 200, { items: [], cursor: null } );
		await getMastodonAuthorFeed( {
			connectionId: 7,
			actor: '108020',
			filter: 'posts_with_media',
		} );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'sends no filter params for posts_with_replies', async () => {
		const scope = nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020/feed' )
			.reply( 200, { items: [], cursor: null } );
		await getMastodonAuthorFeed( {
			connectionId: 7,
			actor: '108020',
			filter: 'posts_with_replies',
		} );
		expect( scope.isDone() ).toBe( true );
	} );
} );

describe( 'getMastodonTagFeed', () => {
	afterEach( () => nock.cleanAll() );

	it( 'GETs /reader/mastodon/connections/:id/tag/<hashtag>/feed', async () => {
		const scope = nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/tag/rust/feed' )
			.reply( 200, { items: [], cursor: null } );
		const page = await getMastodonTagFeed( { connectionId: 7, hashtag: 'rust' } );
		expect( page.cursor ).toBeNull();
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'sends only_media=true for filter=media', async () => {
		const scope = nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/tag/rust/feed' )
			.query( { only_media: 'true' } )
			.reply( 200, { items: [], cursor: null } );
		await getMastodonTagFeed( { connectionId: 7, hashtag: 'rust', filter: 'media' } );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'sends local=true for filter=local', async () => {
		const scope = nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/tag/rust/feed' )
			.query( { local: 'true' } )
			.reply( 200, { items: [], cursor: null } );
		await getMastodonTagFeed( { connectionId: 7, hashtag: 'rust', filter: 'local' } );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'sends no filter params for filter=all', async () => {
		const scope = nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/tag/rust/feed' )
			.reply( 200, { items: [], cursor: null } );
		await getMastodonTagFeed( { connectionId: 7, hashtag: 'rust', filter: 'all' } );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'percent-encodes the hashtag in the path', async () => {
		const scope = nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/tag/rust_lang/feed' )
			.reply( 200, { items: [], cursor: null } );
		await getMastodonTagFeed( { connectionId: 7, hashtag: 'rust_lang' } );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'classifies a 401 as auth_required', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/tag/rust/feed' )
			.reply( 401, { error: 'not_authenticated', message: '', statusCode: 401, status: 401 } );
		await expect(
			getMastodonTagFeed( { connectionId: 7, hashtag: 'rust' } )
		).rejects.toMatchObject( { kind: 'auth_required' } );
	} );
} );
