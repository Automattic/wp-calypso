import nock from 'nock';
import { wpcom } from '../../wpcom-fetcher';
import { createFediversePost, getFediverseNotifications } from '../fetchers';
import type { FediverseNotificationsPage } from '../types';

const BASE = 'https://public-api.wordpress.com';

describe( 'createFediversePost', () => {
	afterEach( () => nock.cleanAll() );

	function defaultServerItem() {
		return {
			id: 'https://example.com/users/me/statuses/1',
			url: 'https://example.com/users/me/statuses/1',
			created_at: '2026-05-11T10:00:00Z',
			account: { id: '1', username: 'me', acct: 'me', display_name: 'Me', avatar: null },
			content: '<p>hi</p>',
			spoiler_text: '',
			sensitive: false,
			language: null,
			in_reply_to_id: null,
			in_reply_to_account_id: null,
			boost: null,
			media: [],
			counts: { replies: 0, boosts: 0, favourites: 0 },
		};
	}

	it( 'POSTs `content` + `visibility` to /reader/fediverse/connections/:id/posts', async () => {
		const scope = nock( BASE )
			.post( '/wpcom/v2/reader/fediverse/connections/7/posts', {
				content: 'hello world',
				visibility: 'public',
			} )
			.reply( 200, { post: defaultServerItem() } );
		const result = await createFediversePost( {
			connectionId: 7,
			content: 'hello world',
			visibility: 'public',
		} );
		expect( result.post.id ).toBe( 'https://example.com/users/me/statuses/1' );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'includes `summary`, `sensitive`, `language` when supplied', async () => {
		const scope = nock( BASE )
			.post( '/wpcom/v2/reader/fediverse/connections/7/posts', ( body ) => {
				return (
					body.content === 'hello' &&
					body.visibility === 'unlisted' &&
					body.summary === 'cw' &&
					body.sensitive === true &&
					body.language === 'en'
				);
			} )
			.reply( 200, { post: defaultServerItem() } );
		await createFediversePost( {
			connectionId: 7,
			content: 'hello',
			visibility: 'unlisted',
			summary: 'cw',
			sensitive: true,
			language: 'en',
		} );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'omits empty `summary` and `false` flags from the wire body', async () => {
		const scope = nock( BASE )
			.post( '/wpcom/v2/reader/fediverse/connections/7/posts', ( body ) => {
				return (
					body.content === 'hello' &&
					body.visibility === 'public' &&
					! ( 'summary' in body ) &&
					! ( 'sensitive' in body ) &&
					! ( 'language' in body )
				);
			} )
			.reply( 200, { post: defaultServerItem() } );
		await createFediversePost( {
			connectionId: 7,
			content: 'hello',
			visibility: 'public',
			summary: '',
		} );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'forwards `idempotencyKey` as the `Idempotency-Key` header', async () => {
		// Spy on `wpcom.req.post` directly: the wpcom transport supports
		// custom headers, and per CM-704 the composer must send a UUID per
		// submit attempt as `Idempotency-Key` so a network retry can't
		// double-post.
		const post = jest
			.spyOn( wpcom.req, 'post' )
			.mockResolvedValue( { post: defaultServerItem() } as never );
		await createFediversePost( {
			connectionId: 7,
			content: 'hello',
			visibility: 'public',
			idempotencyKey: 'a-uuid-1234',
		} );
		expect( post ).toHaveBeenCalledWith(
			expect.objectContaining( {
				path: '/reader/fediverse/connections/7/posts',
				headers: { 'Idempotency-Key': 'a-uuid-1234' },
			} )
		);
		post.mockRestore();
	} );

	it( 'omits the `Idempotency-Key` header when no key is supplied', async () => {
		const post = jest
			.spyOn( wpcom.req, 'post' )
			.mockResolvedValue( { post: defaultServerItem() } as never );
		await createFediversePost( {
			connectionId: 7,
			content: 'hello',
			visibility: 'public',
		} );
		const args = post.mock.calls[ 0 ][ 0 ] as Record< string, unknown >;
		expect( 'headers' in args ).toBe( false );
		post.mockRestore();
	} );

	it( 'classifies a 401 as auth_required', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/fediverse/connections/7/posts' )
			.reply( 401, { error: 'not_authenticated' } );
		await expect(
			createFediversePost( { connectionId: 7, content: 'hi', visibility: 'public' } )
		).rejects.toMatchObject( { kind: 'auth_required' } );
	} );

	it( 'classifies a 403 as publish_disabled (fallback path)', async () => {
		nock( BASE ).post( '/wpcom/v2/reader/fediverse/connections/7/posts' ).reply( 403, {} );
		await expect(
			createFediversePost( { connectionId: 7, content: 'hi', visibility: 'public' } )
		).rejects.toMatchObject( { kind: 'publish_disabled' } );
	} );

	it( 'classifies a body-level fediverse_text_too_long as text_too_long', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/fediverse/connections/7/posts' )
			.reply( 400, { error: 'fediverse_text_too_long', message: 'too long' } );
		await expect(
			createFediversePost( { connectionId: 7, content: 'hi', visibility: 'public' } )
		).rejects.toMatchObject( { kind: 'text_too_long' } );
	} );

	it( 'classifies a 429 as rate_limited with retry_after', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/fediverse/connections/7/posts' )
			.reply( 429, { data: { retry_after: 30 } } );
		await expect(
			createFediversePost( { connectionId: 7, content: 'hi', visibility: 'public' } )
		).rejects.toEqual( { kind: 'rate_limited', retry_after: 30 } );
	} );
} );

describe( 'getFediverseNotifications', () => {
	afterEach( () => nock.cleanAll() );

	it( 'hits the connection-scoped path with cursor + limit', async () => {
		const page: FediverseNotificationsPage = {
			items: [
				{
					id: '13371337',
					protocol_type: 'Like',
					canonical_type: 'like',
					actor: {
						handle: 'jane@example.com',
						display_name: 'Jane',
						avatar_url: null,
						profile_uri: 'https://example.com/users/jane',
					},
					target: {
						kind: 'post',
						uri: 'https://example.com/users/me/statuses/110000000000000001',
						excerpt: '',
					},
					target_url: 'https://example.com/users/me/statuses/110000000000000001',
					created_at: '2026-05-11T12:34:56Z',
					is_read: false,
				},
			],
			next_cursor: 'next',
			seen_at: '2026-05-10T00:00:00Z',
		};
		nock( BASE )
			.get( '/wpcom/v2/reader/fediverse/connections/101/notifications' )
			.query( { cursor: 'abc', limit: '30' } )
			.reply( 200, page );

		const res = await getFediverseNotifications( {
			connectionId: 101,
			cursor: 'abc',
			limit: 30,
		} );
		expect( res ).toEqual( page );
	} );

	it( 'omits cursor + limit when not provided', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/fediverse/connections/101/notifications' )
			.query( {} )
			.reply( 200, { items: [], next_cursor: null, seen_at: null } );

		const res = await getFediverseNotifications( { connectionId: 101 } );
		expect( res.items ).toEqual( [] );
		expect( res.next_cursor ).toBeNull();
	} );

	it( 'forwards types when provided', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/fediverse/connections/101/notifications' )
			.query( { types: 'like,repost' } )
			.reply( 200, { items: [], next_cursor: null, seen_at: null } );

		const res = await getFediverseNotifications( {
			connectionId: 101,
			types: 'like,repost',
		} );
		expect( res.items ).toEqual( [] );
	} );

	it( 'classifies wpcom 401 as auth_required', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/fediverse/connections/101/notifications' )
			.query( {} )
			.reply( 401, { code: 'reader_fediverse_auth_required' } );
		await expect( getFediverseNotifications( { connectionId: 101 } ) ).rejects.toMatchObject( {
			kind: 'auth_required',
		} );
	} );
} );
