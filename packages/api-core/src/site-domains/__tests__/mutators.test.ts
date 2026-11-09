import nock from 'nock';
import request from 'wpcom-xhr-request';
import { setPrimaryDomain } from '../mutators';

const BASE = 'https://public-api.wordpress.com';
const SITE_ID = 12345;
const ATOMIC_ERROR_MESSAGE =
	'Domain name already used [example.com]. TXT record verification is required to bypass this check.';

describe( 'setPrimaryDomain mutator', () => {
	afterEach( () => nock.cleanAll() );

	it( 'resolves on a normal success response', async () => {
		const scope = nock( BASE )
			.post( `/rest/v1.1/sites/${ SITE_ID }/domains/primary`, { domain: 'example.com' } )
			.reply( 200, { success: true } );

		await expect( setPrimaryDomain( SITE_ID, 'example.com' ) ).resolves.toBeUndefined();
		expect( scope.isDone() ).toBe( true );
	} );

	it.each( [ ATOMIC_ERROR_MESSAGE, 'Unable to reach the hosting service.' ] )(
		'rejects with the server message: %s',
		async ( message ) => {
			const scope = nock( BASE )
				.post( `/rest/v1.1/sites/${ SITE_ID }/domains/primary`, { domain: 'example.com' } )
				.reply( 400, { error: 'wpcom_atomic_ping_failed', message } );

			await expect( setPrimaryDomain( SITE_ID, 'example.com' ) ).rejects.toMatchObject( {
				error: 'wpcom_atomic_ping_failed',
				message,
			} );
			expect( scope.isDone() ).toBe( true );
		}
	);
} );

it( 'rejects an HTTP 200 envelope whose inner status is 400', async () => {
	const scope = nock( BASE )
		.post( `/rest/v1.1/sites/${ SITE_ID }/domains/primary`, { domain: 'example.com' } )
		.query( { http_envelope: 1 } )
		.reply( 200, {
			code: 400,
			headers: {},
			body: { error: 'wpcom_atomic_ping_failed', message: ATOMIC_ERROR_MESSAGE },
		} );
	const response = new Promise( ( resolve, reject ) => {
		request(
			{
				path: `/sites/${ SITE_ID }/domains/primary`,
				apiVersion: '1.1',
				method: 'POST',
				query: { http_envelope: 1 },
				body: { domain: 'example.com' },
			},
			( error: Error | null, data: unknown ) => ( error ? reject( error ) : resolve( data ) )
		);
	} );

	await expect( response ).rejects.toMatchObject( {
		status: 400,
		error: 'wpcom_atomic_ping_failed',
		message: ATOMIC_ERROR_MESSAGE,
	} );
	expect( scope.isDone() ).toBe( true );
} );
