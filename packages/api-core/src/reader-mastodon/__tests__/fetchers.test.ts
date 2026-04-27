import nock from 'nock';
import {
	authorizeMastodonConnection,
	completeMastodonConnection,
	getMastodonConnection,
	getMastodonConnections,
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

	it( 'getMastodonConnections classifies unknown errors', async () => {
		nock( BASE ).get( '/wpcom/v2/reader/mastodon/connections' ).reply( 401, {
			error: 'not_authenticated',
			message: '',
			statusCode: 401,
			status: 401,
		} );
		await expect( getMastodonConnections() ).rejects.toMatchObject( { kind: 'unknown' } );
	} );
} );
