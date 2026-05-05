import nock from 'nock';
import {
	authorizeFediverseConnection,
	completeFediverseConnection,
	createFediverseNote,
	deleteFediverseConnection,
	enableFediverseC2s,
	enableFediverseFeature,
	enableFediverseUserActors,
	getFediverseConnection,
	getFediverseConnections,
	getFediverseSiteCapabilities,
} from '../fetchers';

const BASE = 'https://public-api.wordpress.com';

describe( 'fediverse activitypub fetchers', () => {
	afterEach( () => nock.cleanAll() );

	it( 'getFediverseConnections returns the list', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/activitypub/connections' )
			.reply( 200, {
				connections: [
					{
						id: 1,
						site_host: 'example.wordpress.com',
						handle: '@alice@example.wordpress.com',
						avatar: 'https://cdn/avatar.png',
						actor_url: 'https://example.wordpress.com/wp-json/activitypub/1.0/users/1',
						blog_id: 123,
						actor_type: 'user',
					},
				],
			} );
		const res = await getFediverseConnections();
		expect( res.connections ).toHaveLength( 1 );
		expect( res.connections[ 0 ].handle ).toBe( '@alice@example.wordpress.com' );
		expect( res.connections[ 0 ].actor_type ).toBe( 'user' );
	} );

	it( 'getFediverseConnections classifies 401 as auth_required', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/activitypub/connections' )
			.reply( 401, {
				code: 'not_authenticated',
				message: 'Authentication required.',
				data: { status: 401 },
			} );
		await expect( getFediverseConnections() ).rejects.toMatchObject( { kind: 'auth_required' } );
	} );

	it( 'getFediverseConnections classifies 403 as forbidden', async () => {
		nock( BASE ).get( '/wpcom/v2/reader/activitypub/connections' ).reply( 403, {
			statusCode: 403,
			message: 'Forbidden.',
		} );
		await expect( getFediverseConnections() ).rejects.toMatchObject( { kind: 'forbidden' } );
	} );

	it( 'getFediverseConnection GETs /connections/:id', async () => {
		nock( BASE ).get( '/wpcom/v2/reader/activitypub/connections/42' ).reply( 200, {
			id: 42,
			site_host: 'example.wordpress.com',
			handle: '@alice@example.wordpress.com',
			avatar: 'https://cdn/avatar.png',
			actor_url: 'https://example.wordpress.com/wp-json/activitypub/1.0/users/1',
			blog_id: 123,
			actor_type: 'user',
		} );
		const res = await getFediverseConnection( 42 );
		expect( res.id ).toBe( 42 );
		expect( res.actor_type ).toBe( 'user' );
	} );

	it( 'deleteFediverseConnection sends DELETE to /connections/:id', async () => {
		const scope = nock( BASE )
			.delete( '/wpcom/v2/reader/activitypub/connections/7' )
			.reply( 200, {} );
		await deleteFediverseConnection( 7 );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'authorizeFediverseConnection posts step=authorize and returns authorize_url + state', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/activitypub/connections', {
				step: 'authorize',
				blog_id: 123,
				actor: 'user',
			} )
			.reply( 200, {
				authorize_url: 'https://example.wordpress.com/oauth/authorize?state=abc',
				state: 'abc',
			} );
		const res = await authorizeFediverseConnection( { blog_id: 123, actor: 'user' } );
		expect( res.state ).toBe( 'abc' );
		expect( res.authorize_url ).toContain( 'authorize' );
	} );

	it( 'completeFediverseConnection posts step=complete and returns the connection', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/activitypub/connections', {
				step: 'complete',
				code: 'xyz',
				state: 'abc',
			} )
			.reply( 200, {
				id: 99,
				site_host: 'example.wordpress.com',
				handle: '@alice@example.wordpress.com',
				avatar: 'https://cdn/avatar.png',
				actor_url: 'https://example.wordpress.com/wp-json/activitypub/1.0/users/1',
				blog_id: 123,
				actor_type: 'user',
			} );
		const res = await completeFediverseConnection( { code: 'xyz', state: 'abc' } );
		expect( res.id ).toBe( 99 );
	} );

	it( 'completeFediverseConnection classifies ERR_AUTH_REQUIRED as auth_required', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/activitypub/connections' )
			.reply( 401, {
				code: 'ERR_AUTH_REQUIRED',
				message: 'Auth required.',
				data: { status: 401 },
			} );
		await expect(
			completeFediverseConnection( { code: 'xyz', state: 'abc' } )
		).rejects.toMatchObject( { kind: 'auth_required' } );
	} );

	it( 'completeFediverseConnection classifies state_expired (HTTP 400)', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/activitypub/connections' )
			.reply( 400, {
				code: 'state_expired',
				message: 'OAuth state has expired.',
				data: { status: 400 },
			} );
		await expect(
			completeFediverseConnection( { code: 'xyz', state: 'abc' } )
		).rejects.toMatchObject( { kind: 'state_expired' } );
	} );

	it( 'getFediverseSiteCapabilities GETs /sites/:blog_id/capabilities', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/activitypub/sites/123/capabilities' )
			.reply( 200, {
				activitypub_active: true,
				c2s_enabled: true,
				actors: {
					user: { enabled: true, can_enable: true },
					blog: { enabled: false, can_enable: true },
				},
				oauth_metadata: null,
				site_host: 'example.wordpress.com',
				site_kind: 'wpcom',
				current_user_can_publish: true,
			} );
		const res = await getFediverseSiteCapabilities( 123 );
		expect( res.activitypub_active ).toBe( true );
		expect( res.site_kind ).toBe( 'wpcom' );
	} );

	it( 'enableFediverseFeature POSTs to /sites/:blog_id/enable-feature', async () => {
		const scope = nock( BASE )
			.post( '/wpcom/v2/reader/activitypub/sites/123/enable-feature' )
			.reply( 200, { success: true } );
		const res = await enableFediverseFeature( 123 );
		expect( res.success ).toBe( true );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'enableFediverseC2s POSTs to /sites/:blog_id/enable-c2s', async () => {
		const scope = nock( BASE )
			.post( '/wpcom/v2/reader/activitypub/sites/123/enable-c2s' )
			.reply( 200, { success: true } );
		const res = await enableFediverseC2s( 123 );
		expect( res.success ).toBe( true );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'enableFediverseUserActors POSTs to /sites/:blog_id/enable-user-actors', async () => {
		const scope = nock( BASE )
			.post( '/wpcom/v2/reader/activitypub/sites/123/enable-user-actors' )
			.reply( 200, { success: true } );
		const res = await enableFediverseUserActors( 123 );
		expect( res.success ).toBe( true );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'createFediverseNote POSTs to /connections/:id/notes with body { text }', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/activitypub/connections/7/notes', { text: 'Hello world' } )
			.reply( 200, {
				id: 'https://example.wordpress.com/activitypub/notes/1',
				url: 'https://example.wordpress.com/?p=1',
				posted_at: '2024-01-01T00:00:00Z',
			} );
		const res = await createFediverseNote( { connectionId: 7, text: 'Hello world' } );
		expect( res.id ).toBe( 'https://example.wordpress.com/activitypub/notes/1' );
	} );

	it( 'createFediverseNote classifies reader_activitypub_note_empty as note_empty', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/activitypub/connections/7/notes' )
			.reply( 400, {
				code: 'reader_activitypub_note_empty',
				message: 'Note text cannot be empty.',
				data: { status: 400 },
			} );
		await expect( createFediverseNote( { connectionId: 7, text: '' } ) ).rejects.toMatchObject( {
			kind: 'note_empty',
		} );
	} );

	it( 'classifies ERR_RATE_LIMITED with retry_after', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/activitypub/connections' )
			.reply( 429, {
				code: 'ERR_RATE_LIMITED',
				message: 'Too many requests.',
				data: { status: 429, retry_after: 30 },
			} );
		await expect( getFediverseConnections() ).rejects.toEqual( {
			kind: 'rate_limited',
			retry_after: 30,
		} );
	} );

	it( 'classifies ERR_UPSTREAM_UNAVAILABLE as upstream_unavailable', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/activitypub/connections' )
			.reply( 503, {
				code: 'ERR_UPSTREAM_UNAVAILABLE',
				message: 'Service unavailable.',
				data: { status: 503 },
			} );
		await expect( getFediverseConnections() ).rejects.toMatchObject( {
			kind: 'upstream_unavailable',
		} );
	} );

	it( 'classifies ERR_AUTH_FAILED as auth_failed', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/activitypub/connections' )
			.reply( 401, {
				code: 'ERR_AUTH_FAILED',
				message: 'Auth failed.',
				data: { status: 401 },
			} );
		await expect( getFediverseConnections() ).rejects.toMatchObject( { kind: 'auth_failed' } );
	} );

	it( 'classifies 404 HTTP status as not_found', async () => {
		nock( BASE ).get( '/wpcom/v2/reader/activitypub/connections/999' ).reply( 404, {
			statusCode: 404,
			message: 'Not found.',
		} );
		await expect( getFediverseConnection( 999 ) ).rejects.toMatchObject( { kind: 'not_found' } );
	} );
} );
