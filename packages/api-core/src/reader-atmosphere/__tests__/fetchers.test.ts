import nock from 'nock';
import {
	createConnection,
	createFollow,
	createLike,
	createPost,
	createRepost,
	deleteFollow,
	deleteLike,
	deletePost,
	deleteRepost,
	getAtmosphereTagFeed,
	getAuthorFeed,
	getAuthorProfile,
	getConnection,
	getConnections,
	getScopedAuthorFeed,
	getScopedProfile,
	getScopedThread,
	getThread,
	getTimeline,
} from '../fetchers';
import type {
	AtmosphereAuthorFeedPage,
	AtmosphereAuthorProfile,
	AtmosphereFeedItem,
	AtmosphereScopedProfile,
	AtmosphereThreadResponse,
} from '../types';

const BASE = 'https://public-api.wordpress.com';

function makeFeedItem( overrides: Partial< AtmosphereFeedItem > = {} ): AtmosphereFeedItem {
	return {
		uri: 'at://did:plc:default/app.bsky.feed.post/3kdef',
		cid: 'cid-default',
		author: {
			did: 'did:plc:default',
			handle: 'default.bsky.social',
			display_name: '',
			avatar: null,
		},
		created_at: '2026-04-28T10:00:00Z',
		indexed_at: '2026-04-28T10:00:00Z',
		text: '',
		html: '<p></p>',
		lang: [],
		reply_parent: null,
		reply_root: null,
		reason: null,
		embed: null,
		counts: { replies: 0, reposts: 0, likes: 0, quotes: 0 },
		bluesky_url: 'https://bsky.app/profile/default.bsky.social/post/3kdef',
		...overrides,
	};
}

describe( 'atmosphere fetchers', () => {
	afterEach( () => nock.cleanAll() );

	it( 'getConnections returns the list', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/atmosphere/connections' )
			.reply( 200, {
				connections: [
					{
						id: 101,
						handle: 'alice.bsky.social',
						display_name: 'Alice',
						did: 'did:plc:a',
						avatar: null,
					},
				],
			} );
		const res = await getConnections();
		expect( res.connections ).toHaveLength( 1 );
	} );

	it( 'createConnection posts body and returns connection', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/atmosphere/connections', {
				handle: 'alice.bsky.social',
				app_password: 'xxxx',
			} )
			.reply( 200, {
				connection: {
					id: 101,
					handle: 'alice.bsky.social',
					display_name: 'Alice',
					did: 'did:plc:a',
					avatar: null,
				},
			} );
		const res = await createConnection( { handle: 'alice.bsky.social', app_password: 'xxxx' } );
		expect( res.connection.id ).toBe( 101 );
	} );

	it( 'GETs /reader/atmosphere/connections/:id', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/atmosphere/connections/42' )
			.reply( 200, {
				did: 'did:plc:x',
				handle: 'a.bsky.social',
				display_name: 'Alice',
				description: '',
				avatar: null,
				banner: null,
				counts: { followers: 0, follows: 0, posts: 0 },
			} );
		const result = await getConnection( 42 );
		expect( result.handle ).toBe( 'a.bsky.social' );
	} );

	it( 'getConnections classifies unknown errors', async () => {
		nock( BASE ).get( '/wpcom/v2/reader/atmosphere/connections' ).reply( 401, {
			error: 'not_authenticated',
			message: '',
			statusCode: 401,
			status: 401,
		} );
		await expect( getConnections() ).rejects.toMatchObject( { kind: 'unknown' } );
	} );

	describe( 'getTimeline', () => {
		const PATH = '/wpcom/v2/reader/atmosphere/connections/42/timeline';

		afterEach( () => {
			nock.cleanAll();
		} );

		it( 'fetches the first page without a cursor', async () => {
			const body = {
				items: [
					{
						uri: 'at://did:plc:abc/app.bsky.feed.post/x',
						cid: 'cid1',
						author: {
							did: 'did:plc:abc',
							handle: 'a.bsky.social',
							display_name: 'A',
							avatar: null,
						},
						created_at: '2026-04-27T10:00:00Z',
						indexed_at: '2026-04-27T10:00:01Z',
						text: 'hi',
						html: '<p>hi</p>',
						lang: [],
						reply_parent: null,
						reply_root: null,
						reason: null,
						embed: null,
						counts: { replies: 0, reposts: 0, likes: 0, quotes: 0 },
						bluesky_url: 'https://bsky.app/profile/a.bsky.social/post/x',
					},
				],
				cursor: 'next-cursor',
			};
			nock( BASE ).get( PATH ).query( {} ).reply( 200, body );
			const result = await getTimeline( { connectionId: 42 } );
			expect( result ).toEqual( body );
		} );

		it( 'forwards cursor and limit query params', async () => {
			nock( BASE )
				.get( PATH )
				.query( { cursor: 'abc', limit: '25' } )
				.reply( 200, { items: [], cursor: null } );
			const result = await getTimeline( { connectionId: 42, cursor: 'abc', limit: 25 } );
			expect( result ).toEqual( { items: [], cursor: null } );
		} );

		it( 'classifies a 401 as auth_required', async () => {
			nock( BASE )
				.get( PATH )
				.query( {} )
				.reply( 401, { error: 'atmosphere_auth_required', message: 'Reconnect needed' } );
			await expect( getTimeline( { connectionId: 42 } ) ).rejects.toMatchObject( {
				kind: 'auth_required',
			} );
		} );

		it( 'classifies a 429 as rate_limited', async () => {
			nock( BASE )
				.get( PATH )
				.query( {} )
				.reply( 429, {
					error: 'atmosphere_rate_limited',
					message: 'Slow down',
					data: { retry_after: 60 },
				} );
			await expect( getTimeline( { connectionId: 42 } ) ).rejects.toMatchObject( {
				kind: 'rate_limited',
			} );
		} );

		it( 'classifies a 502 as upstream_unavailable', async () => {
			nock( BASE ).get( PATH ).query( {} ).reply( 502, {
				error: 'atmosphere_upstream_unavailable',
				message: 'Bluesky unreachable',
			} );
			await expect( getTimeline( { connectionId: 42 } ) ).rejects.toMatchObject( {
				kind: 'upstream_unavailable',
			} );
		} );

		it( 'classifies a 404 as not_found', async () => {
			nock( BASE ).get( PATH ).query( {} ).reply( 404, {
				error: 'atmosphere_not_found',
				message: 'Connection not found',
			} );
			await expect( getTimeline( { connectionId: 42 } ) ).rejects.toMatchObject( {
				kind: 'not_found',
			} );
		} );

		it( 'classifies a network error as unknown', async () => {
			nock( BASE ).get( PATH ).query( {} ).replyWithError( 'boom' );
			await expect( getTimeline( { connectionId: 42 } ) ).rejects.toMatchObject( {
				kind: 'unknown',
			} );
		} );
	} );

	describe( 'getThread', () => {
		const fixture: AtmosphereThreadResponse = {
			thread: {
				type: 'post',
				post: makeFeedItem( { uri: 'at://did:plc:abc/app.bsky.feed.post/3kabc' } ),
				parent: null,
				replies: [
					{
						type: 'post',
						post: makeFeedItem( { uri: 'at://did:plc:def/app.bsky.feed.post/3kdef' } ),
						parent: null,
						replies: [],
					},
					{
						type: 'not_found',
						uri: 'at://did:plc:ghi/app.bsky.feed.post/3kghi',
					},
				],
			},
		};

		it( 'fetches the thread for a given at-uri with default depth/parentHeight omitted from the request', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/thread' )
				.query( { uri: 'at://did:plc:abc/app.bsky.feed.post/3kabc' } )
				.reply( 200, fixture );

			const got = await getThread( {
				uri: 'at://did:plc:abc/app.bsky.feed.post/3kabc',
			} );
			expect( got ).toEqual( fixture );
		} );

		it( 'forwards depth and parentHeight as query params when supplied', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/thread' )
				.query( {
					uri: 'at://did:plc:abc/app.bsky.feed.post/3kabc',
					depth: '6',
					parentHeight: '80',
				} )
				.reply( 200, fixture );

			const got = await getThread( {
				uri: 'at://did:plc:abc/app.bsky.feed.post/3kabc',
				depth: 6,
				parentHeight: 80,
			} );
			expect( got ).toEqual( fixture );
		} );

		it( 'classifies a 400 atmosphere_bad_request response', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/thread' )
				.query( true )
				.reply( 400, { error: 'atmosphere_bad_request', message: 'Invalid AT-URI.' } );

			await expect( getThread( { uri: 'at://garbage' } ) ).rejects.toMatchObject( {
				kind: 'bad_request',
				message: 'Invalid AT-URI.',
			} );
		} );

		it( 'classifies a 404 atmosphere_not_found response', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/thread' )
				.query( true )
				.reply( 404, { error: 'atmosphere_not_found', message: 'Thread not found.' } );

			await expect(
				getThread( { uri: 'at://did:plc:abc/app.bsky.feed.post/3kabc' } )
			).rejects.toMatchObject( { kind: 'not_found' } );
		} );

		it( 'classifies a 401 atmosphere_auth_required response', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/thread' )
				.query( true )
				.reply( 401, { error: 'atmosphere_auth_required' } );

			await expect(
				getThread( { uri: 'at://did:plc:abc/app.bsky.feed.post/3kabc' } )
			).rejects.toMatchObject( { kind: 'auth_required' } );
		} );

		it( 'classifies a 429 atmosphere_rate_limited response with retry_after', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/thread' )
				.query( true )
				.reply( 429, {
					error: 'atmosphere_rate_limited',
					data: { retry_after: 30 },
				} );

			await expect(
				getThread( { uri: 'at://did:plc:abc/app.bsky.feed.post/3kabc' } )
			).rejects.toMatchObject( { kind: 'rate_limited', retry_after: 30 } );
		} );

		it( 'classifies a 502 atmosphere_upstream_unavailable response', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/thread' )
				.query( true )
				.reply( 502, { error: 'atmosphere_upstream_unavailable' } );

			await expect(
				getThread( { uri: 'at://did:plc:abc/app.bsky.feed.post/3kabc' } )
			).rejects.toMatchObject( { kind: 'upstream_unavailable' } );
		} );

		it( 'classifies a network error as unknown', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/thread' )
				.query( true )
				.replyWithError( 'boom' );

			await expect(
				getThread( { uri: 'at://did:plc:abc/app.bsky.feed.post/3kabc' } )
			).rejects.toMatchObject( { kind: 'unknown' } );
		} );
	} );

	describe( 'getScopedThread', () => {
		const URI = 'at://did:plc:abc/app.bsky.feed.post/3kabc';
		const payload: AtmosphereThreadResponse = {
			thread: {
				type: 'post',
				post: makeFeedItem( {
					uri: URI,
					viewer: {
						like: 'at://did:plc:viewer/app.bsky.feed.like/3klike',
						repost: 'at://did:plc:viewer/app.bsky.feed.repost/3krepost',
					},
				} ),
				parent: null,
				replies: [],
			},
		};

		it( 'GETs /reader/atmosphere/connections/:id/thread with uri and returns the typed response', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/connections/42/thread' )
				.query( { uri: URI } )
				.reply( 200, payload );

			const got = await getScopedThread( { connectionId: 42, uri: URI } );
			expect( got ).toEqual( payload );
		} );

		it( 'forwards depth and parentHeight as query params when supplied', async () => {
			const scope = nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/connections/42/thread' )
				.query( { uri: URI, depth: '6', parentHeight: '80' } )
				.reply( 200, payload );

			await getScopedThread( { connectionId: 42, uri: URI, depth: 6, parentHeight: 80 } );
			expect( scope.isDone() ).toBe( true );
		} );

		it( 'classifies a 401 atmosphere_auth_required response', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/connections/42/thread' )
				.query( true )
				.reply( 401, { error: 'atmosphere_auth_required' } );

			await expect( getScopedThread( { connectionId: 42, uri: URI } ) ).rejects.toMatchObject( {
				kind: 'auth_required',
			} );
		} );

		it( 'classifies a 404 atmosphere_not_found response', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/connections/42/thread' )
				.query( true )
				.reply( 404, { error: 'atmosphere_not_found' } );

			await expect( getScopedThread( { connectionId: 42, uri: URI } ) ).rejects.toMatchObject( {
				kind: 'not_found',
			} );
		} );

		it( 'classifies a network error as unknown', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/connections/42/thread' )
				.query( true )
				.replyWithError( 'boom' );

			await expect( getScopedThread( { connectionId: 42, uri: URI } ) ).rejects.toMatchObject( {
				kind: 'unknown',
			} );
		} );
	} );

	describe( 'getAuthorProfile', () => {
		it( 'fetches the profile for a handle and decodes the response', async () => {
			const payload: AtmosphereAuthorProfile = {
				did: 'did:plc:abc',
				handle: 'alice.bsky.social',
				display_name: 'Alice',
				description: 'plain bio',
				description_html: '<p>plain bio</p>',
				avatar: 'https://cdn.bsky.app/avatar.jpg',
				banner: 'https://cdn.bsky.app/banner.jpg',
				bluesky_url: 'https://bsky.app/profile/alice.bsky.social',
				counts: { followers: 10, follows: 5, posts: 3 },
			};
			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/profile/alice.bsky.social' )
				.reply( 200, payload );

			const result = await getAuthorProfile( { actor: 'alice.bsky.social' } );
			expect( result ).toEqual( payload );
		} );

		it( 'percent-encodes a DID actor before path interpolation', async () => {
			const scope = nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/profile/did%3Aplc%3Aabc123' )
				.reply( 200, { did: 'did:plc:abc123' } );

			await getAuthorProfile( { actor: 'did:plc:abc123' } );
			expect( scope.isDone() ).toBe( true );
		} );

		it( 'classifies a 400 as bad_request', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/profile/badactor' )
				.reply( 400, { error: 'bad_request', message: 'bad' } );

			await expect( getAuthorProfile( { actor: 'badactor' } ) ).rejects.toMatchObject( {
				kind: 'bad_request',
			} );
		} );

		it( 'classifies a 401 as auth_required', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/profile/alice.bsky.social' )
				.reply( 401, { error: 'atmosphere_auth_required' } );

			await expect( getAuthorProfile( { actor: 'alice.bsky.social' } ) ).rejects.toMatchObject( {
				kind: 'auth_required',
			} );
		} );

		it( 'classifies a 404 as not_found', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/profile/missing.bsky.social' )
				.reply( 404, { error: 'atmosphere_not_found' } );

			await expect( getAuthorProfile( { actor: 'missing.bsky.social' } ) ).rejects.toMatchObject( {
				kind: 'not_found',
			} );
		} );

		it( 'classifies a 429 as rate_limited', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/profile/alice.bsky.social' )
				.reply( 429, { error: 'atmosphere_rate_limited' } );

			await expect( getAuthorProfile( { actor: 'alice.bsky.social' } ) ).rejects.toMatchObject( {
				kind: 'rate_limited',
			} );
		} );

		it( 'classifies a 502 as upstream_unavailable', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/profile/alice.bsky.social' )
				.reply( 502, { error: 'atmosphere_upstream_unavailable' } );

			await expect( getAuthorProfile( { actor: 'alice.bsky.social' } ) ).rejects.toMatchObject( {
				kind: 'upstream_unavailable',
			} );
		} );

		it( 'classifies a network error as unknown', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/profile/alice.bsky.social' )
				.replyWithError( 'boom' );

			await expect( getAuthorProfile( { actor: 'alice.bsky.social' } ) ).rejects.toMatchObject( {
				kind: 'unknown',
			} );
		} );
	} );

	describe( 'getAuthorFeed', () => {
		it( 'fetches the first page with no cursor', async () => {
			const payload: AtmosphereAuthorFeedPage = {
				items: [],
				cursor: 'next-cursor',
			};
			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/profile/alice.bsky.social/feed' )
				.reply( 200, payload );

			const result = await getAuthorFeed( { actor: 'alice.bsky.social' } );
			expect( result ).toEqual( payload );
		} );

		it( 'forwards cursor and limit as query params', async () => {
			const scope = nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/profile/alice.bsky.social/feed' )
				.query( { cursor: 'abc', limit: '50' } )
				.reply( 200, { items: [], cursor: null } );

			await getAuthorFeed( { actor: 'alice.bsky.social', cursor: 'abc', limit: 50 } );
			expect( scope.isDone() ).toBe( true );
		} );

		it( 'forwards filter as a query param when set', async () => {
			const scope = nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/profile/alice.bsky.social/feed' )
				.query( { filter: 'posts_with_replies' } )
				.reply( 200, { items: [], cursor: null } );

			await getAuthorFeed( {
				actor: 'alice.bsky.social',
				filter: 'posts_with_replies',
			} );
			expect( scope.isDone() ).toBe( true );
		} );

		it( 'omits filter from the query string when undefined', async () => {
			const scope = nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/profile/alice.bsky.social/feed' )
				.query( ( q ) => ! ( 'filter' in q ) )
				.reply( 200, { items: [], cursor: null } );

			await getAuthorFeed( { actor: 'alice.bsky.social' } );
			expect( scope.isDone() ).toBe( true );
		} );

		it( 'percent-encodes the actor in the path', async () => {
			const scope = nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/profile/did%3Aplc%3Aabc123/feed' )
				.reply( 200, { items: [], cursor: null } );

			await getAuthorFeed( { actor: 'did:plc:abc123' } );
			expect( scope.isDone() ).toBe( true );
		} );

		it( 'classifies error responses through classifyAtmosphereError', async () => {
			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/profile/alice.bsky.social/feed' )
				.reply( 429, { error: 'atmosphere_rate_limited' } );

			await expect( getAuthorFeed( { actor: 'alice.bsky.social' } ) ).rejects.toMatchObject( {
				kind: 'rate_limited',
			} );
		} );

		it( 'classifies a network error as unknown', async () => {
			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/profile/alice.bsky.social/feed' )
				.replyWithError( 'boom' );

			await expect( getAuthorFeed( { actor: 'alice.bsky.social' } ) ).rejects.toMatchObject( {
				kind: 'unknown',
			} );
		} );
	} );

	describe( 'getScopedProfile', () => {
		const payload: AtmosphereScopedProfile = {
			did: 'did:plc:abc',
			handle: 'alice.bsky.social',
			display_name: 'Alice',
			description: '',
			description_html: '',
			avatar: null,
			banner: null,
			bluesky_url: 'https://bsky.app/profile/alice.bsky.social',
			counts: { followers: 1, follows: 2, posts: 3 },
			viewer: { following: null, following_rkey: null, followed_by: false },
		};

		it( 'GETs /reader/atmosphere/connections/:id/profile/:actor and returns the typed profile', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social' )
				.reply( 200, payload );

			const res = await getScopedProfile( { connectionId: 42, actor: 'alice.bsky.social' } );
			expect( res.viewer.followed_by ).toBe( false );
			expect( res.handle ).toBe( 'alice.bsky.social' );
		} );

		it( 'percent-encodes the actor in the path', async () => {
			const scope = nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/did%3Aplc%3Aabc123' )
				.reply( 200, payload );

			await getScopedProfile( { connectionId: 42, actor: 'did:plc:abc123' } );
			expect( scope.isDone() ).toBe( true );
		} );

		it( 'classifies a 401 response as auth_required', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social' )
				.reply( 401, { error: 'atmosphere_auth_required' } );

			await expect(
				getScopedProfile( { connectionId: 42, actor: 'alice.bsky.social' } )
			).rejects.toMatchObject( { kind: 'auth_required' } );
		} );
	} );

	describe( 'getScopedAuthorFeed', () => {
		const PATH = '/wpcom/v2/reader/atmosphere/connections/42/profile/alice.bsky.social/feed';
		const payload: AtmosphereAuthorFeedPage = { items: [], cursor: 'next' };

		it( 'GETs /reader/atmosphere/connections/:id/profile/:actor/feed and returns the page', async () => {
			nock( BASE ).get( PATH ).reply( 200, payload );

			const result = await getScopedAuthorFeed( { connectionId: 42, actor: 'alice.bsky.social' } );
			expect( result ).toEqual( payload );
		} );

		it( 'forwards cursor and limit as query params', async () => {
			const scope = nock( BASE )
				.get( PATH )
				.query( { cursor: 'abc', limit: '50' } )
				.reply( 200, { items: [], cursor: null } );

			await getScopedAuthorFeed( {
				connectionId: 42,
				actor: 'alice.bsky.social',
				cursor: 'abc',
				limit: 50,
			} );
			expect( scope.isDone() ).toBe( true );
		} );

		it( 'forwards filter as a query param when set', async () => {
			const scope = nock( BASE )
				.get( PATH )
				.query( { filter: 'posts_with_replies' } )
				.reply( 200, { items: [], cursor: null } );

			await getScopedAuthorFeed( {
				connectionId: 42,
				actor: 'alice.bsky.social',
				filter: 'posts_with_replies',
			} );
			expect( scope.isDone() ).toBe( true );
		} );

		it( 'omits filter from the query string when undefined', async () => {
			const scope = nock( BASE )
				.get( PATH )
				.query( ( q ) => ! ( 'filter' in q ) )
				.reply( 200, { items: [], cursor: null } );

			await getScopedAuthorFeed( { connectionId: 42, actor: 'alice.bsky.social' } );
			expect( scope.isDone() ).toBe( true );
		} );

		it( 'percent-encodes the actor in the path', async () => {
			const scope = nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/connections/42/profile/did%3Aplc%3Aabc123/feed' )
				.reply( 200, { items: [], cursor: null } );

			await getScopedAuthorFeed( { connectionId: 42, actor: 'did:plc:abc123' } );
			expect( scope.isDone() ).toBe( true );
		} );

		it( 'classifies a 401 atmosphere_auth_required response', async () => {
			nock( BASE ).get( PATH ).reply( 401, { error: 'atmosphere_auth_required' } );

			await expect(
				getScopedAuthorFeed( { connectionId: 42, actor: 'alice.bsky.social' } )
			).rejects.toMatchObject( { kind: 'auth_required' } );
		} );

		it( 'classifies a network error as unknown', async () => {
			nock( BASE ).get( PATH ).replyWithError( 'boom' );

			await expect(
				getScopedAuthorFeed( { connectionId: 42, actor: 'alice.bsky.social' } )
			).rejects.toMatchObject( { kind: 'unknown' } );
		} );
	} );

	describe( 'createFollow', () => {
		const followResponse = {
			follow: {
				uri: 'at://did:plc:viewer/app.bsky.graph.follow/3kfollow',
				cid: 'bafy',
				rkey: '3kfollow',
			},
		};

		it( 'POSTs subject_did to /reader/atmosphere/connections/:id/follows', async () => {
			const scope = nock( BASE )
				.post( '/wpcom/v2/reader/atmosphere/connections/42/follows', {
					subject_did: 'did:plc:abc',
				} )
				.reply( 201, followResponse );

			const res = await createFollow( { connectionId: 42, subject_did: 'did:plc:abc' } );
			expect( scope.isDone() ).toBe( true );
			expect( res.follow.rkey ).toBe( '3kfollow' );
		} );

		it( 'classifies a 502 response as upstream_unavailable', async () => {
			nock( BASE )
				.post( '/wpcom/v2/reader/atmosphere/connections/42/follows' )
				.reply( 502, { error: 'atmosphere_upstream_unavailable' } );

			await expect(
				createFollow( { connectionId: 42, subject_did: 'did:plc:abc' } )
			).rejects.toMatchObject( { kind: 'upstream_unavailable' } );
		} );
	} );

	describe( 'createLike', () => {
		it( 'POSTs to /likes and unwraps the like envelope', async () => {
			nock( BASE )
				.post( '/wpcom/v2/reader/atmosphere/connections/42/likes', {
					post_uri: 'at://did:plc:author/app.bsky.feed.post/3kabc',
					post_cid: 'bafyreid27zk7',
				} )
				.reply( 200, {
					like: {
						uri: 'at://did:plc:caller/app.bsky.feed.like/3krkeyrkeyrke',
						cid: 'bafyreig27zk7',
						rkey: '3krkeyrkeyrke',
					},
				} );

			const result = await createLike( {
				connectionId: 42,
				postUri: 'at://did:plc:author/app.bsky.feed.post/3kabc',
				postCid: 'bafyreid27zk7',
			} );

			expect( result ).toEqual( {
				uri: 'at://did:plc:caller/app.bsky.feed.like/3krkeyrkeyrke',
				cid: 'bafyreig27zk7',
				rkey: '3krkeyrkeyrke',
			} );
		} );

		it( 'classifies 400 as bad_request', async () => {
			nock( BASE )
				.post( '/wpcom/v2/reader/atmosphere/connections/42/likes' )
				.reply( 400, { error: 'atmosphere_bad_request', message: 'Invalid post reference.' } );

			await expect(
				createLike( { connectionId: 42, postUri: 'at://x', postCid: 'y' } )
			).rejects.toMatchObject( { kind: 'bad_request' } );
		} );

		it( 'classifies 401 as auth_required', async () => {
			nock( BASE )
				.post( '/wpcom/v2/reader/atmosphere/connections/42/likes' )
				.reply( 401, { error: 'atmosphere_unauthenticated' } );

			await expect(
				createLike( { connectionId: 42, postUri: 'at://x', postCid: 'y' } )
			).rejects.toMatchObject( { kind: 'auth_required' } );
		} );

		it( 'classifies 429 as rate_limited', async () => {
			nock( BASE )
				.post( '/wpcom/v2/reader/atmosphere/connections/42/likes' )
				.reply( 429, { error: 'atmosphere_rate_limited' } );

			await expect(
				createLike( { connectionId: 42, postUri: 'at://x', postCid: 'y' } )
			).rejects.toMatchObject( { kind: 'rate_limited' } );
		} );

		it( 'classifies 502 as upstream_unavailable', async () => {
			nock( BASE )
				.post( '/wpcom/v2/reader/atmosphere/connections/42/likes' )
				.reply( 502, { error: 'atmosphere_upstream_unavailable' } );

			await expect(
				createLike( { connectionId: 42, postUri: 'at://x', postCid: 'y' } )
			).rejects.toMatchObject( { kind: 'upstream_unavailable' } );
		} );
	} );

	describe( 'deleteFollow', () => {
		it( 'dispatches a real HTTP DELETE to /reader/atmosphere/connections/:id/follows/:rkey', async () => {
			const scope = nock( BASE )
				.delete( '/wpcom/v2/reader/atmosphere/connections/42/follows/3kfollow' )
				.reply( 204 );

			await deleteFollow( { connectionId: 42, rkey: '3kfollow' } );
			expect( scope.isDone() ).toBe( true );
		} );

		it( 'percent-encodes the rkey in the path', async () => {
			const scope = nock( BASE )
				.delete( '/wpcom/v2/reader/atmosphere/connections/42/follows/odd%2Frkey' )
				.reply( 204 );

			await deleteFollow( { connectionId: 42, rkey: 'odd/rkey' } );
			expect( scope.isDone() ).toBe( true );
		} );

		it( 'classifies a 429 response as rate_limited', async () => {
			nock( BASE )
				.delete( '/wpcom/v2/reader/atmosphere/connections/42/follows/3kfollow' )
				.reply( 429, { error: 'atmosphere_rate_limited' } );

			await expect( deleteFollow( { connectionId: 42, rkey: '3kfollow' } ) ).rejects.toMatchObject(
				{ kind: 'rate_limited' }
			);
		} );
	} );

	describe( 'deleteLike', () => {
		it( 'DELETEs /likes/{rkey} and resolves on 204', async () => {
			nock( BASE )
				.delete( '/wpcom/v2/reader/atmosphere/connections/42/likes/3krkeyrkeyrke' )
				.reply( 204 );

			await expect(
				deleteLike( { connectionId: 42, rkey: '3krkeyrkeyrke' } )
			).resolves.toBeUndefined();
		} );

		it( 'classifies 401 as auth_required', async () => {
			nock( BASE )
				.delete( '/wpcom/v2/reader/atmosphere/connections/42/likes/3krkeyrkeyrke' )
				.reply( 401, { error: 'atmosphere_unauthenticated' } );

			await expect(
				deleteLike( { connectionId: 42, rkey: '3krkeyrkeyrke' } )
			).rejects.toMatchObject( {
				kind: 'auth_required',
			} );
		} );

		it( 'classifies 429 as rate_limited', async () => {
			nock( BASE )
				.delete( '/wpcom/v2/reader/atmosphere/connections/42/likes/3krkeyrkeyrke' )
				.reply( 429, { error: 'atmosphere_rate_limited' } );

			await expect(
				deleteLike( { connectionId: 42, rkey: '3krkeyrkeyrke' } )
			).rejects.toMatchObject( {
				kind: 'rate_limited',
			} );
		} );

		it( 'classifies 502 as upstream_unavailable', async () => {
			nock( BASE )
				.delete( '/wpcom/v2/reader/atmosphere/connections/42/likes/3krkeyrkeyrke' )
				.reply( 502, { error: 'atmosphere_upstream_unavailable' } );

			await expect(
				deleteLike( { connectionId: 42, rkey: '3krkeyrkeyrke' } )
			).rejects.toMatchObject( {
				kind: 'upstream_unavailable',
			} );
		} );
	} );

	describe( 'createRepost', () => {
		it( 'POSTs to /reposts and unwraps the repost envelope', async () => {
			nock( BASE )
				.post( '/wpcom/v2/reader/atmosphere/connections/42/reposts', {
					post_uri: 'at://did:plc:author/app.bsky.feed.post/3kabc',
					post_cid: 'bafyreid27zk7',
				} )
				.reply( 200, {
					repost: {
						uri: 'at://did:plc:caller/app.bsky.feed.repost/3krkeyrkeyrke',
						cid: 'bafyreig27zk7',
						rkey: '3krkeyrkeyrke',
					},
				} );

			const result = await createRepost( {
				connectionId: 42,
				postUri: 'at://did:plc:author/app.bsky.feed.post/3kabc',
				postCid: 'bafyreid27zk7',
			} );

			expect( result ).toEqual( {
				uri: 'at://did:plc:caller/app.bsky.feed.repost/3krkeyrkeyrke',
				cid: 'bafyreig27zk7',
				rkey: '3krkeyrkeyrke',
			} );
		} );

		it( 'classifies 400 as bad_request', async () => {
			nock( BASE )
				.post( '/wpcom/v2/reader/atmosphere/connections/42/reposts' )
				.reply( 400, { error: 'atmosphere_bad_request', message: 'Invalid post reference.' } );

			await expect(
				createRepost( { connectionId: 42, postUri: 'at://x', postCid: 'y' } )
			).rejects.toMatchObject( { kind: 'bad_request' } );
		} );

		it( 'classifies 401 as auth_required', async () => {
			nock( BASE )
				.post( '/wpcom/v2/reader/atmosphere/connections/42/reposts' )
				.reply( 401, { error: 'atmosphere_unauthenticated' } );

			await expect(
				createRepost( { connectionId: 42, postUri: 'at://x', postCid: 'y' } )
			).rejects.toMatchObject( { kind: 'auth_required' } );
		} );

		it( 'classifies 429 as rate_limited', async () => {
			nock( BASE )
				.post( '/wpcom/v2/reader/atmosphere/connections/42/reposts' )
				.reply( 429, { error: 'atmosphere_rate_limited' } );

			await expect(
				createRepost( { connectionId: 42, postUri: 'at://x', postCid: 'y' } )
			).rejects.toMatchObject( { kind: 'rate_limited' } );
		} );

		it( 'classifies 502 as upstream_unavailable', async () => {
			nock( BASE )
				.post( '/wpcom/v2/reader/atmosphere/connections/42/reposts' )
				.reply( 502, { error: 'atmosphere_upstream_unavailable' } );

			await expect(
				createRepost( { connectionId: 42, postUri: 'at://x', postCid: 'y' } )
			).rejects.toMatchObject( { kind: 'upstream_unavailable' } );
		} );
	} );

	describe( 'deleteRepost', () => {
		it( 'DELETEs /reposts/{rkey} and resolves on 204', async () => {
			nock( BASE )
				.delete( '/wpcom/v2/reader/atmosphere/connections/42/reposts/3krkeyrkeyrke' )
				.reply( 204 );

			await expect(
				deleteRepost( { connectionId: 42, rkey: '3krkeyrkeyrke' } )
			).resolves.toBeUndefined();
		} );

		it( 'classifies 401 as auth_required', async () => {
			nock( BASE )
				.delete( '/wpcom/v2/reader/atmosphere/connections/42/reposts/3krkeyrkeyrke' )
				.reply( 401, { error: 'atmosphere_unauthenticated' } );

			await expect(
				deleteRepost( { connectionId: 42, rkey: '3krkeyrkeyrke' } )
			).rejects.toMatchObject( { kind: 'auth_required' } );
		} );

		it( 'classifies 429 as rate_limited', async () => {
			nock( BASE )
				.delete( '/wpcom/v2/reader/atmosphere/connections/42/reposts/3krkeyrkeyrke' )
				.reply( 429, { error: 'atmosphere_rate_limited' } );

			await expect(
				deleteRepost( { connectionId: 42, rkey: '3krkeyrkeyrke' } )
			).rejects.toMatchObject( { kind: 'rate_limited' } );
		} );

		it( 'classifies 502 as upstream_unavailable', async () => {
			nock( BASE )
				.delete( '/wpcom/v2/reader/atmosphere/connections/42/reposts/3krkeyrkeyrke' )
				.reply( 502, { error: 'atmosphere_upstream_unavailable' } );

			await expect(
				deleteRepost( { connectionId: 42, rkey: '3krkeyrkeyrke' } )
			).rejects.toMatchObject( { kind: 'upstream_unavailable' } );
		} );
	} );

	describe( 'getAtmosphereTagFeed', () => {
		it( 'GETs /reader/atmosphere/connections/:id/tag/<hashtag>/feed', async () => {
			const scope = nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/connections/7/tag/rust/feed' )
				.reply( 200, {
					items: [],
					cursor: 'NEXT',
					tag: { name: 'rust', count: 100, url: 'https://bsky.app/hashtag/rust' },
				} );
			const result = await getAtmosphereTagFeed( { connectionId: 7, hashtag: 'rust' } );
			expect( result.cursor ).toBe( 'NEXT' );
			expect( result.tag?.name ).toBe( 'rust' );
			expect( result.tag?.count ).toBe( 100 );
			expect( scope.isDone() ).toBe( true );
		} );

		it( 'forwards cursor and limit as query params', async () => {
			const scope = nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/connections/7/tag/rust/feed' )
				.query( { cursor: 'PAGE2', limit: '50' } )
				.reply( 200, { items: [], cursor: null } );
			await getAtmosphereTagFeed( {
				connectionId: 7,
				hashtag: 'rust',
				cursor: 'PAGE2',
				limit: 50,
			} );
			expect( scope.isDone() ).toBe( true );
		} );

		it( 'percent-encodes Unicode hashtags in the path', async () => {
			const scope = nock( BASE )
				.get(
					'/wpcom/v2/reader/atmosphere/connections/7/tag/' +
						encodeURIComponent( '日本語' ) +
						'/feed'
				)
				.reply( 200, { items: [], cursor: null } );
			await getAtmosphereTagFeed( { connectionId: 7, hashtag: '日本語' } );
			expect( scope.isDone() ).toBe( true );
		} );

		it( 'classifies a 401 as auth_required', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/connections/7/tag/rust/feed' )
				.reply( 401, { error: 'atmosphere_auth_required' } );
			await expect(
				getAtmosphereTagFeed( { connectionId: 7, hashtag: 'rust' } )
			).rejects.toMatchObject( { kind: 'auth_required' } );
		} );

		it( 'classifies a 429 as rate_limited', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/connections/7/tag/rust/feed' )
				.reply( 429, { error: 'atmosphere_rate_limited' } );
			await expect(
				getAtmosphereTagFeed( { connectionId: 7, hashtag: 'rust' } )
			).rejects.toMatchObject( { kind: 'rate_limited' } );
		} );
	} );

	describe( 'createPost', () => {
		const connectionId = 42;

		afterEach( () => nock.cleanAll() );

		it( 'POSTs the request body and returns the parsed result', async () => {
			nock( BASE )
				.post( '/wpcom/v2/reader/atmosphere/connections/42/posts', {
					text: 'hi there',
					reply: {
						root: { uri: 'at://r', cid: 'rcid' },
						parent: { uri: 'at://p', cid: 'pcid' },
					},
				} )
				.reply( 200, {
					post: { uri: 'at://new', cid: 'newcid', rkey: 'abc' },
				} );

			const result = await createPost( {
				connectionId,
				text: 'hi there',
				reply: {
					root: { uri: 'at://r', cid: 'rcid' },
					parent: { uri: 'at://p', cid: 'pcid' },
				},
			} );

			expect( result ).toEqual( { uri: 'at://new', cid: 'newcid', rkey: 'abc' } );
		} );

		it( 'omits reply when posting standalone', async () => {
			const scope = nock( BASE )
				.post( '/wpcom/v2/reader/atmosphere/connections/42/posts', ( body ) => {
					return body.text === 'standalone' && ! body.reply && ! body.quote;
				} )
				.reply( 200, { post: { uri: 'at://x', cid: 'xc', rkey: 'r' } } );

			await createPost( { connectionId, text: 'standalone' } );
			expect( scope.isDone() ).toBe( true );
		} );

		it.each( [
			[ 400, 'atmosphere_bad_request', 'bad_request' ],
			[ 400, 'atmosphere_text_too_long', 'text_too_long' ],
			[ 401, 'atmosphere_auth_required', 'auth_required' ],
			[ 401, 'atmosphere_unauthenticated', 'auth_required' ],
			[ 403, 'atmosphere_reply_disabled', 'reply_disabled' ],
			[ 403, 'atmosphere_quote_disabled', 'quote_disabled' ],
			[ 404, 'atmosphere_not_found', 'not_found' ],
			[ 404, 'atmosphere_target_unavailable', 'target_unavailable' ],
			[ 429, 'atmosphere_rate_limited', 'rate_limited' ],
			[ 502, 'atmosphere_upstream_unavailable', 'upstream_unavailable' ],
		] )( 'classifies HTTP %i %s as kind %s', async ( status, error, kind ) => {
			nock( BASE )
				.post( '/wpcom/v2/reader/atmosphere/connections/42/posts' )
				.reply( status as number, { error } );

			await expect( createPost( { connectionId, text: 'x' } ) ).rejects.toMatchObject( { kind } );
		} );
	} );

	describe( 'deletePost', () => {
		const connectionId = 99;
		const rkey = '3kabc';

		it( 'issues DELETE to the connection-scoped post path with no body', async () => {
			const scope = nock( 'https://public-api.wordpress.com' )
				.delete( `/wpcom/v2/reader/atmosphere/connections/${ connectionId }/posts/${ rkey }` )
				.reply( 204 );

			await expect( deletePost( { connectionId, rkey } ) ).resolves.toBeUndefined();
			expect( scope.isDone() ).toBe( true );
		} );

		it.each( [
			[ 401, 'atmosphere_auth_required', 'auth_required' ],
			[ 404, 'atmosphere_not_found', 'not_found' ],
			[ 429, 'atmosphere_rate_limited', 'rate_limited' ],
			[ 502, 'atmosphere_upstream_unavailable', 'upstream_unavailable' ],
			[ 500, 'whatever', 'unknown' ],
		] as const )( 'classifies %i (%s) responses as %s', async ( status, errorCode, kind ) => {
			nock( 'https://public-api.wordpress.com' )
				.delete( `/wpcom/v2/reader/atmosphere/connections/${ connectionId }/posts/${ rkey }` )
				.reply( status, { error: errorCode, message: 'no' } );

			await expect( deletePost( { connectionId, rkey } ) ).rejects.toMatchObject( { kind } );
		} );
	} );
} );
