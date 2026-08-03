import nock from 'nock';
import { wpcom } from '../../wpcom-fetcher';
import {
	authorizeMastodonConnection,
	completeMastodonConnection,
	createMastodonFollow,
	createMastodonLike,
	createMastodonPost,
	createMastodonRepost,
	deleteMastodonFollow,
	deleteMastodonLike,
	deleteMastodonRepost,
	getMastodonAuthStatus,
	getMastodonAuthorFeed,
	getMastodonAuthorProfile,
	getMastodonConnection,
	getMastodonConnections,
	getMastodonInstanceConfig,
	getMastodonNotifications,
	getMastodonTagFeed,
	getMastodonTimeline,
	uploadMastodonMedia,
} from '../fetchers';
import type { MastodonNotificationsPage } from '../types';

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

	it( 'getMastodonInstanceConfig GETs /reader/mastodon/connections/:id/instance-config', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/42/instance-config' )
			.reply( 200, { max_characters: 4096 } );
		const result = await getMastodonInstanceConfig( 42 );
		expect( result.max_characters ).toBe( 4096 );
	} );

	it( 'getMastodonInstanceConfig classifies a 502 as upstream_unavailable', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/42/instance-config' )
			.reply( 502, {
				code: 'mastodon_upstream_unavailable',
				message: '',
				data: { status: 502 },
			} );
		await expect( getMastodonInstanceConfig( 42 ) ).rejects.toMatchObject( {
			kind: 'upstream_unavailable',
		} );
	} );

	it( 'getMastodonConnections classifies 401 as auth_required', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections' )
			.reply( 401, {
				code: 'not_authenticated',
				message: 'Authentication required.',
				data: { status: 401 },
			} );
		await expect( getMastodonConnections() ).rejects.toMatchObject( { kind: 'auth_required' } );
	} );

	it( 'getMastodonAuthStatus returns { needs_reauth } for the connection', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/42/auth-status' )
			.reply( 200, { needs_reauth: true } );
		const res = await getMastodonAuthStatus( 42 );
		expect( res.needs_reauth ).toBe( true );
	} );

	it( 'getMastodonAuthStatus surfaces classified errors', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/42/auth-status' )
			.reply( 401, { code: 'reader_mastodon_unauthenticated' } );
		await expect( getMastodonAuthStatus( 42 ) ).rejects.toMatchObject( {
			kind: 'auth_required',
		} );
	} );

	it( 'getMastodonAuthStatus rejects responses missing needs_reauth', async () => {
		// Without shape validation a response of `{}` types as `needs_reauth:
		// undefined` and the gate's `!== true` check silently treats it as
		// healthy — surface it as an unknown error instead so the gate falls
		// through to children rather than locking users out incorrectly.
		nock( BASE ).get( '/wpcom/v2/reader/mastodon/connections/42/auth-status' ).reply( 200, {} );
		await expect( getMastodonAuthStatus( 42 ) ).rejects.toMatchObject( { kind: 'unknown' } );
	} );

	it( 'getMastodonAuthStatus rejects responses with non-boolean needs_reauth', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/42/auth-status' )
			.reply( 200, { needs_reauth: 'yes' } );
		await expect( getMastodonAuthStatus( 42 ) ).rejects.toMatchObject( { kind: 'unknown' } );
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
			.reply( 429, {
				code: 'mastodon_rate_limited',
				message: '',
				data: { status: 429, retry_after: 30 },
			} );
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
			.reply( 401, {
				code: 'not_authenticated',
				message: 'Authentication required.',
				data: { status: 401 },
			} );
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
			.reply( 401, {
				code: 'not_authenticated',
				message: 'Authentication required.',
				data: { status: 401 },
			} );
		await expect(
			getMastodonTagFeed( { connectionId: 7, hashtag: 'rust' } )
		).rejects.toMatchObject( { kind: 'auth_required' } );
	} );
} );

describe( 'createMastodonLike', () => {
	afterEach( () => nock.cleanAll() );

	it( 'POSTs /reader/mastodon/connections/:id/likes with status_id in the body', async () => {
		const scope = nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/likes', { status_id: '108020' } )
			.reply( 200, { status_id: '108020' } );
		await createMastodonLike( { connectionId: 7, statusId: '108020' } );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'classifies a 401 as auth_required', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/likes', { status_id: '108020' } )
			.reply( 401, { error: 'not_authenticated', message: '', statusCode: 401, status: 401 } );
		await expect(
			createMastodonLike( { connectionId: 7, statusId: '108020' } )
		).rejects.toMatchObject( { kind: 'auth_required' } );
	} );

	it( 'classifies a 429 as rate_limited with retry_after', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/likes', { status_id: '108020' } )
			.reply( 429, { error: 'mastodon_rate_limited', data: { retry_after: 30 } } );
		await expect( createMastodonLike( { connectionId: 7, statusId: '108020' } ) ).rejects.toEqual( {
			kind: 'rate_limited',
			retry_after: 30,
		} );
	} );
} );

describe( 'deleteMastodonLike', () => {
	afterEach( () => nock.cleanAll() );

	it( 'DELETEs /reader/mastodon/connections/:id/likes/:status_id', async () => {
		const scope = nock( BASE )
			.delete( '/wpcom/v2/reader/mastodon/connections/7/likes/108020' )
			.reply( 204 );
		await deleteMastodonLike( { connectionId: 7, statusId: '108020' } );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'classifies a 401 as auth_required', async () => {
		nock( BASE )
			.delete( '/wpcom/v2/reader/mastodon/connections/7/likes/108020' )
			.reply( 401, { error: 'not_authenticated', message: '', statusCode: 401, status: 401 } );
		await expect(
			deleteMastodonLike( { connectionId: 7, statusId: '108020' } )
		).rejects.toMatchObject( { kind: 'auth_required' } );
	} );

	it( 'classifies a 404 as not_found (e.g. another user’s connection)', async () => {
		nock( BASE )
			.delete( '/wpcom/v2/reader/mastodon/connections/7/likes/108020' )
			.reply( 404, { error: 'connection_not_found', message: '', statusCode: 404, status: 404 } );
		await expect(
			deleteMastodonLike( { connectionId: 7, statusId: '108020' } )
		).rejects.toMatchObject( { kind: 'connection_not_found' } );
	} );
} );

describe( 'createMastodonRepost', () => {
	afterEach( () => nock.cleanAll() );

	it( 'POSTs /reader/mastodon/connections/:id/reposts with status_id in the body', async () => {
		const scope = nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/reposts', { status_id: '108020' } )
			.reply( 200, { status_id: '108020' } );
		await createMastodonRepost( { connectionId: 7, statusId: '108020' } );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'classifies a 401 as auth_required', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/reposts', { status_id: '108020' } )
			.reply( 401, { error: 'not_authenticated', message: '', statusCode: 401, status: 401 } );
		await expect(
			createMastodonRepost( { connectionId: 7, statusId: '108020' } )
		).rejects.toMatchObject( { kind: 'auth_required' } );
	} );

	it( 'classifies a 429 as rate_limited with retry_after', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/reposts', { status_id: '108020' } )
			.reply( 429, { error: 'mastodon_rate_limited', data: { retry_after: 30 } } );
		await expect( createMastodonRepost( { connectionId: 7, statusId: '108020' } ) ).rejects.toEqual(
			{ kind: 'rate_limited', retry_after: 30 }
		);
	} );
} );

describe( 'deleteMastodonRepost', () => {
	afterEach( () => nock.cleanAll() );

	it( 'DELETEs /reader/mastodon/connections/:id/reposts/:status_id', async () => {
		const scope = nock( BASE )
			.delete( '/wpcom/v2/reader/mastodon/connections/7/reposts/108020' )
			.reply( 204 );
		await deleteMastodonRepost( { connectionId: 7, statusId: '108020' } );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'classifies a 401 as auth_required', async () => {
		nock( BASE )
			.delete( '/wpcom/v2/reader/mastodon/connections/7/reposts/108020' )
			.reply( 401, { error: 'not_authenticated', message: '', statusCode: 401, status: 401 } );
		await expect(
			deleteMastodonRepost( { connectionId: 7, statusId: '108020' } )
		).rejects.toMatchObject( { kind: 'auth_required' } );
	} );

	it( 'classifies a 404 as not_found (e.g. another user’s connection)', async () => {
		nock( BASE )
			.delete( '/wpcom/v2/reader/mastodon/connections/7/reposts/108020' )
			.reply( 404, { error: 'connection_not_found', message: '', statusCode: 404, status: 404 } );
		await expect(
			deleteMastodonRepost( { connectionId: 7, statusId: '108020' } )
		).rejects.toMatchObject( { kind: 'connection_not_found' } );
	} );
} );

describe( 'createMastodonPost', () => {
	afterEach( () => nock.cleanAll() );

	it( 'POSTs /reader/mastodon/connections/:id/statuses with status in the body', async () => {
		const scope = nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/statuses', { status: 'hello world' } )
			.reply( 200, { id: '999', url: 'https://mastodon.social/@me/999', in_reply_to_id: null } );
		const result = await createMastodonPost( { connectionId: 7, status: 'hello world' } );
		expect( result.id ).toBe( '999' );
		expect( result.in_reply_to_id ).toBeNull();
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'POSTs status + in_reply_to_id when replying', async () => {
		const scope = nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/statuses', {
				status: 'a reply',
				in_reply_to_id: '108020',
			} )
			.reply( 200, {
				id: '999',
				url: 'https://mastodon.social/@me/999',
				in_reply_to_id: '108020',
			} );
		const result = await createMastodonPost( {
			connectionId: 7,
			status: 'a reply',
			in_reply_to_id: '108020',
		} );
		expect( result.in_reply_to_id ).toBe( '108020' );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'POSTs status + quoted_status_id when quoting', async () => {
		const scope = nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/statuses', {
				status: 'commentary',
				quoted_status_id: '116522382646486388',
			} )
			.reply( 200, {
				id: '999',
				url: 'https://mastodon.social/@me/999',
				in_reply_to_id: null,
			} );
		const result = await createMastodonPost( {
			connectionId: 7,
			status: 'commentary',
			quoted_status_id: '116522382646486388',
		} );
		expect( result.id ).toBe( '999' );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'strips the client-only quotedFallbackPermalink before sending', async () => {
		// The body matcher below would fail if the fetcher leaked
		// `quotedFallbackPermalink` into the wire payload.
		const scope = nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/statuses', ( body ) => {
				return (
					body.status === 'commentary' &&
					body.quoted_status_id === '116522382646486388' &&
					! ( 'quotedFallbackPermalink' in body )
				);
			} )
			.reply( 200, { id: '999', url: 'https://mastodon.social/@me/999', in_reply_to_id: null } );
		await createMastodonPost( {
			connectionId: 7,
			status: 'commentary',
			quoted_status_id: '116522382646486388',
			quotedFallbackPermalink: 'https://mastodon.social/@alice/116522382646486388',
		} );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'classifies a 401 as auth_required', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/statuses', { status: 'hello' } )
			.reply( 401, { error: 'not_authenticated', message: '', statusCode: 401, status: 401 } );
		await expect(
			createMastodonPost( { connectionId: 7, status: 'hello' } )
		).rejects.toMatchObject( { kind: 'auth_required' } );
	} );

	it( 'classifies a 429 as rate_limited with retry_after', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/statuses', { status: 'hello' } )
			.reply( 429, { error: 'mastodon_rate_limited', data: { retry_after: 30 } } );
		await expect( createMastodonPost( { connectionId: 7, status: 'hello' } ) ).rejects.toEqual( {
			kind: 'rate_limited',
			retry_after: 30,
		} );
	} );

	it( 'includes media_ids and sensitive when supplied', async () => {
		const post = jest.spyOn( wpcom.req, 'post' ).mockResolvedValue( {
			id: '1',
			url: 'https://i.example/1',
			in_reply_to_id: null,
		} );
		await createMastodonPost( {
			connectionId: 5,
			status: 'with image',
			media_ids: [ 'm1', 'm2' ],
			sensitive: true,
		} );
		expect( post.mock.calls[ 0 ][ 0 ].body ).toEqual( {
			status: 'with image',
			media_ids: [ 'm1', 'm2' ],
			sensitive: true,
		} );
		post.mockRestore();
	} );

	it( 'omits media_ids and sensitive when not supplied', async () => {
		const post = jest.spyOn( wpcom.req, 'post' ).mockResolvedValue( {
			id: '1',
			url: 'u',
			in_reply_to_id: null,
		} );
		await createMastodonPost( { connectionId: 5, status: 'plain' } );
		expect( post.mock.calls[ 0 ][ 0 ].body ).toEqual( { status: 'plain' } );
		post.mockRestore();
	} );

	it( 'omits media_ids when an empty array is supplied', async () => {
		const post = jest.spyOn( wpcom.req, 'post' ).mockResolvedValue( {
			id: '1',
			url: 'u',
			in_reply_to_id: null,
		} );
		await createMastodonPost( {
			connectionId: 5,
			status: 'plain',
			media_ids: [],
		} );
		expect( post.mock.calls[ 0 ][ 0 ].body ).toEqual( { status: 'plain' } );
		post.mockRestore();
	} );

	it( 'forwards `visibility` and `spoiler_text` when supplied (CM-710)', async () => {
		const post = jest.spyOn( wpcom.req, 'post' ).mockResolvedValue( {
			id: '1',
			url: 'u',
			in_reply_to_id: null,
		} );
		await createMastodonPost( {
			connectionId: 5,
			status: 'hi',
			visibility: 'private',
			spoiler_text: 'spoilers',
		} );
		expect( post.mock.calls[ 0 ][ 0 ].body ).toEqual( {
			status: 'hi',
			visibility: 'private',
			spoiler_text: 'spoilers',
		} );
		post.mockRestore();
	} );

	it( 'omits `spoiler_text` when an empty string is supplied', async () => {
		const post = jest.spyOn( wpcom.req, 'post' ).mockResolvedValue( {
			id: '1',
			url: 'u',
			in_reply_to_id: null,
		} );
		await createMastodonPost( {
			connectionId: 5,
			status: 'hi',
			visibility: 'public',
			spoiler_text: '',
		} );
		expect( post.mock.calls[ 0 ][ 0 ].body ).toEqual( {
			status: 'hi',
			visibility: 'public',
		} );
		post.mockRestore();
	} );
} );

describe( 'uploadMastodonMedia', () => {
	// Multipart can't be exercised end-to-end through nock here: the wpcom
	// transport hands its `formData` to superagent's Node adapter, which
	// streams via `form-data` and rejects jsdom Blob/File instances with
	// `source.on is not a function`. Spying on `wpcom.req.post` keeps the
	// fetcher contract under test (path, namespace, formData envelope shape).
	it( 'sends a multipart POST with file + description envelope', async () => {
		const post = jest.spyOn( wpcom.req, 'post' ).mockResolvedValue( {
			id: '789',
			type: 'image',
			url: 'https://files.example/789.jpg',
			preview_url: 'https://files.example/789-thumb.jpg',
			description: 'a cat',
		} );
		const file = new File( [ 'xyz' ], 'cat.jpg', { type: 'image/jpeg' } );

		const result = await uploadMastodonMedia( {
			connectionId: 42,
			file,
			description: 'a cat',
		} );

		expect( post ).toHaveBeenCalledTimes( 1 );
		const callArg = post.mock.calls[ 0 ][ 0 ];
		expect( callArg.path ).toBe( '/reader/mastodon/connections/42/media' );
		expect( callArg.apiNamespace ).toBe( 'wpcom/v2' );
		expect( callArg.formData ).toEqual( [
			[ 'file', { fileContents: file, fileName: 'cat.jpg' } ],
			[ 'description', 'a cat' ],
		] );
		expect( result.id ).toBe( '789' );
		post.mockRestore();
	} );

	it( 'omits description from formData when undefined', async () => {
		const post = jest.spyOn( wpcom.req, 'post' ).mockResolvedValue( {
			id: '1',
			type: 'image',
			url: null,
			preview_url: null,
			description: '',
		} );
		const file = new File( [ 'x' ], 'a.png', { type: 'image/png' } );
		await uploadMastodonMedia( { connectionId: 7, file } );

		expect( post.mock.calls[ 0 ][ 0 ].formData ).toEqual( [
			[ 'file', { fileContents: file, fileName: 'a.png' } ],
		] );
		post.mockRestore();
	} );

	it( 'falls back to "blob" when file.name is empty', async () => {
		const post = jest.spyOn( wpcom.req, 'post' ).mockResolvedValue( {
			id: '1',
			type: 'image',
			url: 'u',
			preview_url: 'p',
			description: '',
		} );
		const blob = new Blob( [ 'x' ], { type: 'image/jpeg' } );
		await uploadMastodonMedia( { connectionId: 7, file: blob as File } );
		expect( post.mock.calls[ 0 ][ 0 ].formData[ 0 ][ 1 ] ).toEqual( {
			fileContents: blob,
			fileName: 'blob',
		} );
		post.mockRestore();
	} );

	it( 'surfaces 202-processing result with null url/preview_url', async () => {
		const post = jest.spyOn( wpcom.req, 'post' ).mockResolvedValue( {
			id: '999',
			type: 'image',
			url: null,
			preview_url: null,
			description: '',
		} );
		const file = new File( [ 'x' ], 'p.jpg', { type: 'image/jpeg' } );
		const r = await uploadMastodonMedia( { connectionId: 1, file } );
		expect( r ).toEqual( {
			id: '999',
			type: 'image',
			url: null,
			preview_url: null,
			description: '',
		} );
		post.mockRestore();
	} );

	it( 'classifies wpcom errors via classifyMastodonError', async () => {
		const post = jest.spyOn( wpcom.req, 'post' ).mockRejectedValue( {
			error: 'mastodon_media_too_large',
			message: 'image too large',
			statusCode: 400,
		} );
		const file = new File( [ 'x' ], 'a.jpg', { type: 'image/jpeg' } );
		await expect( uploadMastodonMedia( { connectionId: 1, file } ) ).rejects.toMatchObject( {
			kind: 'media_too_large',
		} );
		post.mockRestore();
	} );
} );

describe( 'createMastodonFollow', () => {
	afterEach( () => nock.cleanAll() );

	it( 'POSTs /reader/mastodon/connections/:id/follows with account_id in the body and returns the viewer block', async () => {
		const scope = nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/follows', { account_id: '200' } )
			.reply( 200, {
				viewer: { following: true, followed_by: false, requested: false },
			} );
		const res = await createMastodonFollow( { connectionId: 7, accountId: '200' } );
		expect( res.viewer ).toEqual( { following: true, followed_by: false, requested: false } );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'classifies a 401 as auth_required', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/follows', { account_id: '200' } )
			.reply( 401, {
				error: 'reader_mastodon_unauthenticated',
				message: '',
				statusCode: 401,
				status: 401,
			} );
		await expect(
			createMastodonFollow( { connectionId: 7, accountId: '200' } )
		).rejects.toMatchObject( { kind: 'auth_required' } );
	} );

	it.each( [
		[ '{} is rejected', {} ],
		[ 'viewer: null is rejected', { viewer: null } ],
		[ 'viewer: {} is rejected', { viewer: {} } ],
		[ 'viewer missing requested is rejected', { viewer: { following: true, followed_by: false } } ],
		[
			'viewer with non-boolean fields is rejected',
			{ viewer: { following: 'yes', followed_by: false, requested: false } },
		],
	] )( 'rejects a malformed payload (%s) as bad_request', async ( _label, body ) => {
		nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/follows', { account_id: '200' } )
			.reply( 200, body );
		await expect(
			createMastodonFollow( { connectionId: 7, accountId: '200' } )
		).rejects.toMatchObject( { kind: 'bad_request' } );
	} );

	it.each( [
		[
			'404 with reader_mastodon_not_found',
			{ status: 404, body: { code: 'reader_mastodon_not_found' } },
			'not_found',
		],
		[
			'429 surfaces as rate_limited',
			{ status: 429, body: { statusCode: 429, status: 429 } },
			'rate_limited',
		],
		[
			'502 with reader_mastodon_upstream_unavailable',
			{ status: 502, body: { code: 'reader_mastodon_upstream_unavailable' } },
			'upstream_unavailable',
		],
		[
			'400 with reader_mastodon_bad_request',
			{ status: 400, body: { code: 'reader_mastodon_bad_request', message: 'no such id' } },
			'bad_request',
		],
	] )( 'classifies %s correctly', async ( _label, fixture, expectedKind ) => {
		nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections/7/follows', { account_id: '200' } )
			.reply( fixture.status, fixture.body );
		await expect(
			createMastodonFollow( { connectionId: 7, accountId: '200' } )
		).rejects.toMatchObject( { kind: expectedKind } );
	} );
} );

describe( 'deleteMastodonFollow', () => {
	afterEach( () => nock.cleanAll() );

	it( 'DELETEs /reader/mastodon/connections/:id/follows/:account_id and returns the viewer block', async () => {
		const scope = nock( BASE )
			.delete( '/wpcom/v2/reader/mastodon/connections/7/follows/200' )
			.reply( 200, {
				viewer: { following: false, followed_by: false, requested: false },
			} );
		const res = await deleteMastodonFollow( { connectionId: 7, accountId: '200' } );
		expect( res.viewer ).toEqual( { following: false, followed_by: false, requested: false } );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'URL-encodes the account id defensively', async () => {
		const scope = nock( BASE )
			.delete( '/wpcom/v2/reader/mastodon/connections/7/follows/200%2Ffoo' )
			.reply( 200, {
				viewer: { following: false, followed_by: false, requested: false },
			} );
		await deleteMastodonFollow( { connectionId: 7, accountId: '200/foo' } );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'classifies a 401 as auth_required', async () => {
		nock( BASE ).delete( '/wpcom/v2/reader/mastodon/connections/7/follows/200' ).reply( 401, {
			error: 'reader_mastodon_unauthenticated',
			message: '',
			statusCode: 401,
			status: 401,
		} );
		await expect(
			deleteMastodonFollow( { connectionId: 7, accountId: '200' } )
		).rejects.toMatchObject( { kind: 'auth_required' } );
	} );

	it.each( [
		[
			'404 with reader_mastodon_not_found',
			{ status: 404, body: { code: 'reader_mastodon_not_found' } },
			'not_found',
		],
		[
			'429 surfaces as rate_limited',
			{ status: 429, body: { statusCode: 429, status: 429 } },
			'rate_limited',
		],
		[
			'502 with reader_mastodon_upstream_unavailable',
			{ status: 502, body: { code: 'reader_mastodon_upstream_unavailable' } },
			'upstream_unavailable',
		],
	] )( 'classifies %s correctly', async ( _label, fixture, expectedKind ) => {
		nock( BASE )
			.delete( '/wpcom/v2/reader/mastodon/connections/7/follows/200' )
			.reply( fixture.status, fixture.body );
		await expect(
			deleteMastodonFollow( { connectionId: 7, accountId: '200' } )
		).rejects.toMatchObject( { kind: expectedKind } );
	} );
} );

describe( 'getMastodonNotifications', () => {
	afterEach( () => nock.cleanAll() );

	it( 'hits the connection-scoped path with cursor + limit', async () => {
		const page: MastodonNotificationsPage = {
			items: [
				{
					id: '13371337',
					protocol_type: 'favourite',
					canonical_type: 'like',
					actor: {
						handle: 'jane@mastodon.social',
						display_name: 'Jane',
						avatar_url: null,
						profile_uri: 'https://mastodon.social/@jane',
					},
					target: {
						kind: 'post',
						uri: 'https://mastodon.social/@me/110000000000000001',
						excerpt: '',
					},
					target_url: 'https://mastodon.social/@me/110000000000000001',
					created_at: '2026-05-11T12:34:56Z',
					is_read: false,
				},
			],
			next_cursor: 'next',
			seen_at: '2026-05-10T00:00:00Z',
		};
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/101/notifications' )
			.query( { cursor: 'abc', limit: '30' } )
			.reply( 200, page );

		const res = await getMastodonNotifications( {
			connectionId: 101,
			cursor: 'abc',
			limit: 30,
		} );
		expect( res ).toEqual( page );
	} );

	it( 'omits cursor + limit when not provided', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/101/notifications' )
			.query( {} )
			.reply( 200, { items: [], next_cursor: null, seen_at: null } );

		const res = await getMastodonNotifications( { connectionId: 101 } );
		expect( res.items ).toEqual( [] );
		expect( res.next_cursor ).toBeNull();
	} );

	it( 'classifies wpcom 401 as auth_required', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/101/notifications' )
			.query( {} )
			.reply( 401, { code: 'reader_mastodon_auth_required' } );
		await expect( getMastodonNotifications( { connectionId: 101 } ) ).rejects.toMatchObject( {
			kind: 'auth_required',
		} );
	} );

	it( 'getMastodonNotifications forwards types when provided', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/101/notifications' )
			.query( { types: 'like,repost' } )
			.reply( 200, { items: [], next_cursor: null, seen_at: null } );

		const res = await getMastodonNotifications( {
			connectionId: 101,
			types: 'like,repost',
		} );
		expect( res.items ).toEqual( [] );
	} );

	it( 'getMastodonNotifications omits types when not provided', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/101/notifications' )
			.query( {} )
			.reply( 200, { items: [], next_cursor: null, seen_at: null } );

		const res = await getMastodonNotifications( { connectionId: 101 } );
		expect( res.items ).toEqual( [] );
	} );

	it( 'getMastodonNotifications omits types when empty string', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/101/notifications' )
			.query( {} )
			.reply( 200, { items: [], next_cursor: null, seen_at: null } );

		const res = await getMastodonNotifications( { connectionId: 101, types: '' } );
		expect( res.items ).toEqual( [] );
	} );
} );
