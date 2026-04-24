import nock from 'nock';
import {
	createMastodonConnection,
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
						handle: 'alice',
						instance: 'mastodon.social',
						display_name: 'Alice',
						avatar: null,
					},
				],
			} );
		const res = await getMastodonConnections();
		expect( res.connections ).toHaveLength( 1 );
		expect( res.connections[ 0 ].instance ).toBe( 'mastodon.social' );
	} );

	it( 'createMastodonConnection posts body and returns connection', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections', {
				instance: 'mastodon.social',
				handle: 'alice',
				access_token: 'xxxx',
			} )
			.reply( 200, {
				connection: {
					id: 101,
					handle: 'alice',
					instance: 'mastodon.social',
					display_name: 'Alice',
					avatar: null,
				},
			} );
		const res = await createMastodonConnection( {
			instance: 'mastodon.social',
			handle: 'alice',
			access_token: 'xxxx',
		} );
		expect( res.connection.id ).toBe( 101 );
	} );

	it( 'GETs /reader/mastodon/connections/:id', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/42' )
			.reply( 200, {
				handle: 'alice',
				instance: 'mastodon.social',
				display_name: 'Alice',
				description: '',
				avatar: null,
				header: null,
				counts: { followers: 0, following: 0, toots: 0 },
				raw: {},
			} );
		const result = await getMastodonConnection( 42 );
		expect( result.handle ).toBe( 'alice' );
		expect( result.instance ).toBe( 'mastodon.social' );
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
