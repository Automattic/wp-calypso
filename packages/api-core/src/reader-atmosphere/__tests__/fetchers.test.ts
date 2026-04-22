import nock from 'nock';
import { createConnection, getConnections, verifyConnection } from '../fetchers';

const BASE = 'https://public-api.wordpress.com';

describe( 'atmosphere fetchers', () => {
	afterEach( () => nock.cleanAll() );

	it( 'getConnections returns the list', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/atmosphere/connections' )
			.reply( 200, {
				connections: [ { id: 101, handle: 'alice.bsky.social', did: 'did:plc:a', avatar: null } ],
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
				connection: { id: 101, handle: 'alice.bsky.social', did: 'did:plc:a', avatar: null },
			} );
		const res = await createConnection( { handle: 'alice.bsky.social', app_password: 'xxxx' } );
		expect( res.connection.id ).toBe( 101 );
	} );

	it( 'verifyConnection returns profile', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/atmosphere/connections/101/verify' )
			.reply( 200, {
				did: 'did:plc:a',
				handle: 'alice',
				display_name: 'Alice',
				description: '',
				avatar: null,
				banner: null,
				counts: { followers: 1, follows: 2, posts: 3 },
				raw: {},
			} );
		const res = await verifyConnection( 101 );
		expect( res.handle ).toBe( 'alice' );
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
