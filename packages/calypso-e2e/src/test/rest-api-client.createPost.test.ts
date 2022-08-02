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

// Persist and intercept all bearer token calls in these tests.
nock( BEARER_TOKEN_URL )
	.persist()
	.post( /.*/ )
	.reply( 200, {
		success: true,
		data: {
			bearer_token: 'abcdefghijklmn',
			token_links: [ 'link_1', 'link_2' ],
		},
	} );

describe( 'RestAPIClient: createPost', function () {
	const restAPIClient = new RestAPIClient( {
		username: 'fake_user',
		password: 'fake_password',
	} );
	const siteID = 2789;
	const requestURL = restAPIClient.getRequestURL( '1.1', `/sites/${ siteID }/posts/new` );

	test( 'Post can be created with only title parameter', async function () {
		const title = 'test';
		const testData = {
			title: title,
			URL: `https://faketestsite.com/2022/07/26/${ title }`,
		};

		nock( requestURL.origin ).post( requestURL.pathname ).reply( 200, testData );

		const response = await restAPIClient.createPost( siteID, { title: title } );

		expect( response.URL ).toBe( 'https://faketestsite.com/2022/07/26/test' );
		expect( response.title ).toBe( title );
	} );

	test( 'Post can be created with required and optional parameters', async function () {
		const title = 'test';
		const testData = {
			title: title,
			URL: `https://faketestsite.com/2022/07/26/${ title }`,
		};

		nock( requestURL.origin ).post( requestURL.pathname ).reply( 200, testData );

		const response = await restAPIClient.createPost( siteID, {
			title: title,
			date: new Date(),
			content: 'test content',
		} );

		expect( response.URL ).toBe( 'https://faketestsite.com/2022/07/26/test' );
		expect( response.title ).toBe( title );
	} );
} );
