import nock from 'nock';
import { createConnection, getConnection, getConnections, getTimeline } from '../fetchers';

const BASE = 'https://public-api.wordpress.com';

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
				raw: {},
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
} );
