import { describe, expect, test, jest } from '@jest/globals';
import nock from 'nock';
import { RestAPIClient, BEARER_TOKEN_URL } from '../rest-api-client';
import { SecretsManager } from '../secrets';
import type { Secrets } from '../secrets';

const fakeSecrets = {
	calypsoOauthApplication: {
		client_id: 'some_value',
		client_secret: 'some_value',
	},
	testAccounts: {
		basicUser: {
			username: 'wpcomuser2',
			password: 'hunter2',
			primarySite: 'wpcomuser.wordpress.com/',
		},
		noUrlUser: {
			username: 'nourluser',
			password: 'password1234',
		},
	},
} as unknown as Secrets;

jest.spyOn( SecretsManager, 'secrets', 'get' ).mockImplementation( () => fakeSecrets );

describe( 'RestAPIClient: getBearerToken', function () {
	test( 'Bearer Token is returned upon successful request', async function () {
		const mockedToken = 'abcdefghijklmn';

		nock( BEARER_TOKEN_URL )
			.post( /.*/ )
			.reply( 200, {
				success: true,
				data: {
					bearer_token: mockedToken,
					token_links: [ 'link_1', 'link_2' ],
				},
			} );

		const restAPIClient = new RestAPIClient( {
			username: 'user',
			password: 'password',
		} );
		const bearerToken = await restAPIClient.getBearerToken();

		expect( bearerToken ).toBeDefined();
		expect( bearerToken ).toBe( mockedToken );
		expect( typeof bearerToken ).toBe( 'string' );
	} );

	test.each( [
		{
			code: 'incorrect_password',
			message: `Oops, that's not the right password. Please try again!`,
		},
		{
			code: 'invalid_username',
			message: `We don't seem to have an account with that name. Double-check the spelling and try again!`,
		},
	] )( `Throws error with expected code and message ($code)`, async function ( { code, message } ) {
		nock( BEARER_TOKEN_URL )
			.post( /.*/ )
			.reply( 200, {
				success: false,
				data: {
					errors: [
						{
							code: code,
							message: message,
						},
					],
				},
			} );

		const restAPIClient = new RestAPIClient( {
			username: 'fake_user',
			password: 'fake_password',
		} );

		await expect( restAPIClient.getBearerToken() ).rejects.toThrow( `${ code }: ${ message }` );
	} );
} );
