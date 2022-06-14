/* eslint-disable @typescript-eslint/no-explicit-any */
// Disable the any check in order to mock private methods.

import { describe, expect, jest, test } from '@jest/globals';
import { SecretsManager } from '..';
import { RestAPIClient } from '../rest-api-client';

describe( 'RestAPIClient: private methods', function () {
	test( 'Test: getBearerToken with valid credentials returns a valid bearer token', async function () {
		const credentials = SecretsManager.secrets.testAccounts.defaultUser;
		const restAPIClient = new RestAPIClient( {
			username: credentials.username,
			password: credentials.password,
		} );
		const bearerToken = await ( restAPIClient as any ).getBearerToken();

		expect( bearerToken ).toBeDefined();
		expect( typeof bearerToken ).toBe( 'string' );
		expect( bearerToken.length ).toBe( 64 );
	} );

	test( 'Test: getBearerToken with invalid username throws an error', async function () {
		const restAPIClient = new RestAPIClient( {
			username: 'fake_user',
			password: 'fake_password',
		} );
		await expect( ( restAPIClient as any ).getBearerToken() ).rejects.toThrowError(
			"invalid_username: We don't seem to have an account with that name. Double-check the spelling and try again!"
		);
	} );

	test( 'Test: getBearerToken with invalid password throws an error', async function () {
		const credentials = SecretsManager.secrets.testAccounts.defaultUser;
		const restAPIClient = new RestAPIClient( {
			username: credentials.username,
			password: 'fake_password',
		} );
		await expect( ( restAPIClient as any ).getBearerToken() ).rejects.toThrowError(
			"incorrect_password: Oops, that's not the right password. Please try again!"
		);
	} );

	test( 'Test: getAuthorizationHeader with supported scheme returns a valid authorization header string', async function () {
		const restAPIClient = new RestAPIClient( {
			username: 'fake_username',
			password: 'fake_password',
		} );

		const mockedBearerToken = 'abcd';
		jest
			.spyOn( RestAPIClient.prototype as any, 'getBearerToken' )
			.mockReturnValueOnce( mockedBearerToken );
		const authorizationHeader = await ( restAPIClient as any ).getAuthorizationHeader( 'bearer' );

		expect( authorizationHeader ).toEqual( `Bearer ${ mockedBearerToken }` );
	} );

	test( 'Test: getAuthorizationHeader with unsupported scheme throws an error', async function () {
		const restAPIClient = new RestAPIClient( {
			username: 'fake_username',
			password: 'fake_password',
		} );

		await expect(
			( restAPIClient as any ).getAuthorizationHeader( 'unsupported scheme' )
		).rejects.toThrowError( 'Unsupported authorization scheme specified.' );
	} );

	test.each( [
		{
			version: '1.1',
			endpoint: '/leading-slash',
			expected: `/rest/v1.1/leading-slash`,
		},
		{
			version: '1.1',
			endpoint: 'no-leading-slash',
			expected: `/rest/v1.1/no-leading-slash`,
		},
		{
			version: '1.1',
			endpoint: '/trailing-slash/',
			expected: `/rest/v1.1/trailing-slash`,
		},
	] )(
		'Test: getRequestURL returns expected values',
		async function ( { version, endpoint, expected } ) {
			const restAPIClient = new RestAPIClient( {
				username: 'fake_username',
				password: 'fake_password',
			} );

			const formattedEndpoint = ( restAPIClient as any ).getRequestURL( version, endpoint );

			expect( formattedEndpoint.pathname ).toEqual( expected );
		}
	);
} );

describe( 'RestAPIClient: getMyAccountInformation', function () {
	test( 'Test: expected data is returned for defaultUser', async function () {
		const credentials = SecretsManager.secrets.testAccounts.defaultUser;
		const restAPIClient = new RestAPIClient( {
			username: credentials.username,
			password: credentials.password,
		} );
		const response = await restAPIClient.getMyAccountInformation();

		expect( response.username ).toBe( credentials.username );
		expect( new URL( response.primary_blog_url ).hostname ).toEqual( credentials.primarySite );
		expect( response.ID ).toBe( credentials.userID );
		expect( response.email ).toBe( credentials.email );
	} );

	test( 'Test: error is returned for invalid credentials', async function () {
		const restAPIClient = new RestAPIClient( { username: 'fakeuser', password: 'test' } );
		await expect( restAPIClient.getMyAccountInformation() ).rejects.toThrow(
			"incorrect_password: Oops, that's not the right password. Please try again!"
		);
	} );
} );

describe( 'RestAPIClient: getAllSites', function () {
	test( 'Test: expected data is returned for eCommerceUser', async function () {
		const credentials = SecretsManager.secrets.testAccounts.eCommerceUser;
		const restAPIClient = new RestAPIClient( {
			username: credentials.username,
			password: credentials.password,
		} );
		const response = await restAPIClient.getAllSites();
		const sites = response.sites.map( ( site ) => site.URL );

		// Origin doesn't have the trailing slash, while the site URL returned
		// by the API contains trailing slashes and are thus hrefs.
		expect( sites ).toContain( new URL( `https://${ credentials.primarySite }` ).origin );
	} );
} );
