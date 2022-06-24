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

		await expect( restAPIClient.getBearerToken() ).rejects.toThrowError(
			`${ code }: ${ message }`
		);
	} );
} );

describe( 'RestAPIClient: getMyAccountInformation', function () {
	const restAPIClient = new RestAPIClient( {
		username: 'fake_user',
		password: 'fake_password',
	} );
	const requestURL = restAPIClient.getRequestURL( '1.1', '/me' );

	test( 'Account information is returned on successful request', async function () {
		const testData = {
			ID: 420,
			username: 'maryJane',
			email: 'maryJane@test.com',
			primary_blog: 199,
			primary_blog_url: 'maryjane.test.com',
			language: 'en',
		};
		nock( requestURL.origin ).get( requestURL.pathname ).reply( 200, testData );

		const response = await restAPIClient.getMyAccountInformation();
		expect( response.username ).toBe( testData.username );
		expect( response.primary_blog_url ).toEqual( testData.primary_blog_url );
		expect( response.ID ).toBe( testData.ID );
		expect( response.email ).toBe( testData.email );
	} );

	test.each( [
		{
			code: 'invalid_token',
			message: `The OAuth2 token is invalid`,
		},
		{
			code: 'invalid_username',
			message: `We don't seem to have an account with that name. Double-check the spelling and try again!`,
		},
	] )( `Throws error with expected code and message ($code)`, async function ( { code, message } ) {
		nock( requestURL.origin )
			.get( requestURL.pathname )
			.reply( 400, { error: code, message: message } );

		await expect( restAPIClient.getMyAccountInformation() ).rejects.toThrowError(
			`${ code }: ${ message }`
		);
	} );
} );

describe( 'RestAPIClient: getAllSites', function () {
	const restAPIClient = new RestAPIClient( {
		username: 'fake_user',
		password: 'fake_password',
	} );
	const requestURL = restAPIClient.getRequestURL( '1.1', '/me/sites' );

	test( 'Sites are returned on successful request', async function () {
		const testData = {
			sites: [
				{
					ID: 5420,
					name: 'Site One',
					description: 'My amazing site',
					URL: 'https://myamazinsite.test.com',
					site_owner: 420,
				},
				{
					ID: 8799,
					name: 'Site Two',
					description: 'My amazing site, redux',
					URL: 'https://myamazinsiteredux.test.com',
					site_owner: 420,
				},
			],
		};

		nock( requestURL.origin ).get( requestURL.pathname ).reply( 200, testData );

		const response = await restAPIClient.getAllSites();
		expect( response.sites.length ).toBe( 2 );
		expect( response.sites[ 0 ].ID ).toBe( 5420 );
		expect( response.sites[ 1 ].ID ).toBe( 8799 );
	} );

	test.each( [
		{
			code: 'invalid_token',
			message: `The OAuth2 token is invalid`,
		},
	] )( `Throws error with expected code and message ($code)`, async function ( { code, message } ) {
		nock( requestURL.origin )
			.get( requestURL.pathname )
			.reply( 400, { error: code, message: message } );

		await expect( restAPIClient.getAllSites() ).rejects.toThrowError( `${ code }: ${ message }` );
	} );
} );
