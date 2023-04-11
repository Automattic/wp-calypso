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

describe( 'RestAPIClient: getRenderedPatterns', function () {
	const restAPIClient = new RestAPIClient( {
		username: 'fake_user',
		password: 'fake_password',
	} );
	const siteID = 2789;
	const requestURL = restAPIClient.getRequestURL(
		'2',
		`/sites/${ siteID }/block-renderer/patterns/render`,
		'wpcom'
	);

	test( 'should make a request', async function () {
		const expected = {
			12345: {
				ID: 'ID',
				html: 'html',
				styles: [
					{
						css: 'css',
						isGlobalStyles: false,
					},
				],
			},
		};
		nock( requestURL.origin ).get( requestURL.pathname ).reply( 200, expected );
		const response = await restAPIClient.getRenderedPatterns( siteID );
		expect( response ).toEqual( expected );
	} );
} );
