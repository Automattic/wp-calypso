import nock from 'nock';
import { createConnection, getConnection, getConnections } from '../fetchers';

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
} );
