import { describe, expect, test, jest } from '@jest/globals';
import nock from 'nock';
import { Roles } from '../lib';
import { RestAPIClient, BEARER_TOKEN_URL } from '../rest-api-client';
import { SecretsManager } from '../secrets';
import { AllInvitesResponse, NewInviteResponse } from '../types';
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

describe( 'RestAPIClient: getInvites', function () {
	const restAPIClient = new RestAPIClient( {
		username: 'fake_user',
		password: 'fake_password',
	} );
	const siteID = 4823;
	const requestURL = restAPIClient.getRequestURL( '1.1', `/sites/${ siteID }/invites` );

	test( '1 invite is returned', async function () {
		const testData = {
			invites: [
				{
					invite_key: 'abcdefgh',
					role: 'editor',
					is_pending: true,
					user: {
						email: 'testemail@test.com',
					},
					invited_by: {
						ID: '5420',
						login: 'test_user_88',
						site_ID: siteID,
					},
				},
			],
		};

		nock( requestURL.origin ).get( requestURL.pathname ).reply( 200, testData );

		const response: AllInvitesResponse = await restAPIClient.getInvites( siteID );
		expect( response ).toHaveLength( 1 );
	} );

	test( 'No invites are returned', async function () {
		const testData = {
			invites: [],
		};

		nock( requestURL.origin ).get( requestURL.pathname ).reply( 200, testData );

		const response: AllInvitesResponse = await restAPIClient.getInvites( siteID );
		expect( response ).toHaveLength( 0 );
	} );
} );

describe( 'RestAPIClient: createInvite', function () {
	const restAPIClient = new RestAPIClient( {
		username: 'fake_user',
		password: 'fake_password',
	} );
	const siteID = 4823;
	const requestURL = restAPIClient.getRequestURL( '1.1', `/sites/${ siteID }/invites/new` );

	test( 'Invite is successfully created', async function () {
		const testEmails = [ 'test1@test.com', 'test2@test.com' ];
		const role = 'Editor' as Roles;
		const message = 'Test message';
		const testResponse = {
			sent: testEmails,
			errors: [],
		};

		nock( requestURL.origin ).post( requestURL.pathname ).reply( 200, testResponse );

		const response: NewInviteResponse = await restAPIClient.createInvite( siteID, {
			email: testEmails,
			role: role,
			message: message,
		} );
		expect( response.sent ).toEqual( testEmails );
		expect( response.errors.length ).toBe( 0 );
	} );

	test( 'Invite is rejected due to existing user email', async function () {
		const testSuccessfulEmails = [ 'test1@test.com' ];
		const testFailedEmails = [ 'test1@test.com' ];
		const role = 'Editor' as Roles;
		const testResponse = {
			sent: testSuccessfulEmails,
			errors: testFailedEmails,
		};

		nock( requestURL.origin ).post( requestURL.pathname ).reply( 200, testResponse );

		await expect( () =>
			restAPIClient.createInvite( siteID, {
				email: testSuccessfulEmails.concat( testFailedEmails ),
				role: role,
			} )
		).rejects.toThrow();
	} );
} );
