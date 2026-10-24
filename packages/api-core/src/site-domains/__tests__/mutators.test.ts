import nock from 'nock';
import { setPrimaryDomain } from '../mutators';

const BASE = 'https://public-api.wordpress.com';
const SITE_ID = 12345;
const ATOMIC_ERROR_MESSAGE =
	'Setting domain-as-primary failed: Domain name already used [example.com]. TXT record verification is required to bypass this check.';

describe( 'setPrimaryDomain mutator', () => {
	afterEach( () => nock.cleanAll() );

	it( 'resolves on a normal success response', async () => {
		nock( BASE )
			.post( `/rest/v1.1/sites/${ SITE_ID }/domains/primary` )
			.reply( 200, { success: true } );

		await expect( setPrimaryDomain( SITE_ID, 'example.com' ) ).resolves.toBeUndefined();
	} );

	it( 'rejects with the API message when the response body has error: true', async () => {
		nock( BASE ).post( `/rest/v1.1/sites/${ SITE_ID }/domains/primary` ).reply( 200, {
			error: true,
			message: ATOMIC_ERROR_MESSAGE,
		} );

		await expect( setPrimaryDomain( SITE_ID, 'example.com' ) ).rejects.toThrow(
			ATOMIC_ERROR_MESSAGE
		);
	} );
} );
