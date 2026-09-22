import { afterEach, beforeEach, describe, expect, test, jest } from '@jest/globals';
import nock from 'nock';
import * as teamcity from '../lib/teamcity';
import {
	flushThrottleWrites,
	registerThrottleActionHandler,
	resetThrottleState,
} from '../lib/throttle-flags';
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
			message: 'The OAuth2 token is invalid',
		},
		{
			code: 'invalid_username',
			message:
				"We don't seem to have an account with that name. Double-check the spelling and try again!",
		},
	] )( 'Throws error with expected code and message ($code)', async function ( { code, message } ) {
		nock( requestURL.origin )
			.get( requestURL.pathname )
			.reply( 400, { error: code, message: message } );

		await expect( restAPIClient.getMyAccountInformation() ).rejects.toThrow(
			`${ code }: ${ message }`
		);
	} );
} );

describe( 'RestAPIClient: getAllDomains', function () {
	const restAPIClient = new RestAPIClient( {
		username: 'fake_user',
		password: 'fake_password',
	} );
	const requestURL = restAPIClient.getRequestURL( '1.1', '/all-domains/' );

	test( 'Sites are returned on successful request', async function () {
		const testData = {
			domains: [
				{
					blog_id: 5420,
					domain: 'myamazinsite.test.com',
				},
				{
					blog_id: 8799,
					domain: 'myamazinsiteredux.test.com',
				},
			],
		};

		nock( requestURL.origin ).get( requestURL.pathname ).reply( 200, testData );

		const response = await restAPIClient.getAllDomains();
		expect( response.domains.length ).toBe( 2 );
		expect( response.domains[ 0 ].blog_id ).toBe( 5420 );
		expect( response.domains[ 1 ].blog_id ).toBe( 8799 );
	} );

	test.each( [
		{
			code: 'invalid_token',
			message: 'The OAuth2 token is invalid',
		},
	] )( 'Throws error with expected code and message ($code)', async function ( { code, message } ) {
		nock( requestURL.origin )
			.get( requestURL.pathname )
			.reply( 400, { error: code, message: message } );

		await expect( restAPIClient.getAllDomains() ).rejects.toThrow( `${ code }: ${ message }` );
	} );
} );

describe( 'RestAPIClient: createSite', function () {
	const restAPIClient = new RestAPIClient( {
		username: 'fake_user',
		password: 'fake_password',
	} );
	const requestURL = restAPIClient.getRequestURL( '1.1', '/sites/new' );

	test( 'Site metadata is returned on successful request', async function () {
		const testResponse = {
			success: true,
			blog_details: {
				url: 'https://fakeblog.blog.com',
				blogid: '420',
				blogname: 'fake_blog_name',
				site_slug: 'fakeblog.blog.com',
			},
		};

		nock( requestURL.origin ).post( requestURL.pathname ).reply( 200, testResponse );

		const response = await restAPIClient.createSite( {
			name: 'fake_blog_name',
			title: 'fake_blog_title',
		} );

		expect( response ).not.toHaveProperty( 'error' );
		expect( response.success ).toBe( true );
	} );

	test( 'Optional site creation settings are sent on request', async function () {
		let requestBody: unknown;
		const testResponse = {
			success: true,
			blog_details: {
				url: 'https://fakeblog.blog.com',
				blogid: '420',
				blogname: 'fake_blog_name',
				site_slug: 'fakeblog.blog.com',
			},
		};

		const scope = nock( requestURL.origin )
			.post( requestURL.pathname, ( body ) => {
				requestBody = body;
				return true;
			} )
			.reply( 200, testResponse );

		await restAPIClient.createSite( {
			name: 'fake_blog_name',
			title: 'fake_blog_title',
			public: 0,
			find_available_url: true,
			options: {
				site_creation_flow: 'onboarding',
				wpcom_public_coming_soon: 1,
			},
		} );

		expect( scope.isDone() ).toBe( true );
		expect( requestBody ).toMatchObject( {
			blog_name: 'fake_blog_name',
			blog_title: 'fake_blog_title',
			public: 0,
			find_available_url: true,
			options: {
				site_creation_flow: 'onboarding',
				wpcom_public_coming_soon: 1,
			},
		} );
	} );

	let tagOwnBuild: jest.SpiedFunction< typeof teamcity.tagOwnBuild >;
	let appendOwnBuildLog: jest.SpiedFunction< typeof teamcity.appendOwnBuildLog >;
	let warn: jest.SpiedFunction< typeof console.warn >;
	let throttleActionHandler: jest.Mock;
	let unregisterThrottleActionHandler: () => void;

	beforeEach( () => {
		throttleActionHandler = jest.fn();
		unregisterThrottleActionHandler = registerThrottleActionHandler( throttleActionHandler );
		delete process.env.THROTTLE_SIGNUP_EXPIRATION;
		delete process.env.E2E_THROTTLE_SIGNUP_ACTION;
	} );

	// Restores only what the test below spies on: the file-level
	// `SecretsManager.secrets` spy is what lets every test here run without a
	// decrypted secrets file, and `restoreAllMocks` would take it with it.
	afterEach( () => {
		tagOwnBuild?.mockRestore();
		appendOwnBuildLog?.mockRestore();
		warn?.mockRestore();
		unregisterThrottleActionHandler();
		delete process.env.THROTTLE_SIGNUP_EXPIRATION;
		resetThrottleState();
	} );

	test( 'An active signup throttle acts before the request is sent', async function () {
		const sendRequest = jest.spyOn( restAPIClient, 'sendRequest' );
		process.env.THROTTLE_SIGNUP_EXPIRATION = String( Date.now() + 60_000 );
		throttleActionHandler.mockImplementation( () => {
			throw new Error( 'policy applied' );
		} );

		await expect(
			restAPIClient.createSite( { name: 'fake_blog_name', title: 'fake_blog_title' } )
		).rejects.toThrow( 'policy applied' );
		expect( sendRequest ).not.toHaveBeenCalled();
		sendRequest.mockRestore();
	} );

	test( 'A throttled response raises a flag and still fails the call', async function () {
		tagOwnBuild = jest.spyOn( teamcity, 'tagOwnBuild' ).mockResolvedValue( 200 );
		appendOwnBuildLog = jest.spyOn( teamcity, 'appendOwnBuildLog' ).mockResolvedValue( 200 );
		warn = jest.spyOn( console, 'warn' ).mockImplementation( () => undefined );
		nock( requestURL.origin ).post( requestURL.pathname ).reply( 403, {
			error: 'throttled',
			message: 'Limit reached. You can try again in 10 minutes.',
		} );

		// Detection records the throttle; it does not change how the call fails.
		await expect(
			restAPIClient.createSite( { name: 'fake_blog_name', title: 'fake_blog_title' } )
		).rejects.toThrow( 'throttled: Limit reached. You can try again in 10 minutes.' );

		// Recording runs behind the call rather than in front of it, so settle it.
		await flushThrottleWrites();

		expect( tagOwnBuild ).toHaveBeenCalledWith( 'throttle-signup' );
		expect( appendOwnBuildLog ).toHaveBeenCalledWith( expect.stringContaining( 'type=signup' ) );
		expect( appendOwnBuildLog ).toHaveBeenCalledWith(
			expect.stringContaining( 'duration=600000' )
		);
		expect( throttleActionHandler ).toHaveBeenCalledWith( 'skip', [ 'signup' ] );
	} );

	test( 'A throttled call answers without waiting for the write', async function () {
		let settle: ( status: number ) => void = () => undefined;
		tagOwnBuild = jest.spyOn( teamcity, 'tagOwnBuild' ).mockResolvedValue( 200 );
		appendOwnBuildLog = jest
			.spyOn( teamcity, 'appendOwnBuildLog' )
			.mockImplementation( () => new Promise< number >( ( resolve ) => ( settle = resolve ) ) );
		warn = jest.spyOn( console, 'warn' ).mockImplementation( () => undefined );
		nock( requestURL.origin ).post( requestURL.pathname ).reply( 403, { error: 'throttled' } );

		// TeamCity has not answered, and the caller is through regardless: what a
		// test spends on a throttle is the throttled call, not the telling.
		await expect(
			restAPIClient.createSite( { name: 'fake_blog_name', title: 'fake_blog_title' } )
		).rejects.toThrow( 'throttled' );
		expect( tagOwnBuild ).not.toHaveBeenCalled();

		settle( 200 );
		await flushThrottleWrites();
	} );

	test( 'A throttled response is recognised without the sentence too', async function () {
		tagOwnBuild = jest.spyOn( teamcity, 'tagOwnBuild' ).mockResolvedValue( 200 );
		appendOwnBuildLog = jest.spyOn( teamcity, 'appendOwnBuildLog' ).mockResolvedValue( 200 );
		warn = jest.spyOn( console, 'warn' ).mockImplementation( () => undefined );
		nock( requestURL.origin ).post( requestURL.pathname ).reply( 403, { error: 'throttled' } );

		// The code alone settles it on this endpoint, and only the caller knows
		// which endpoint answered: the body does not carry it.
		await expect(
			restAPIClient.createSite( { name: 'fake_blog_name', title: 'fake_blog_title' } )
		).rejects.toThrow( 'throttled' );

		expect( tagOwnBuild ).toHaveBeenCalledWith( 'throttle-signup' );
	} );

	test( 'A refusal that is not JSON acts on the call that met it', async function () {
		tagOwnBuild = jest.spyOn( teamcity, 'tagOwnBuild' ).mockResolvedValue( 200 );
		appendOwnBuildLog = jest.spyOn( teamcity, 'appendOwnBuildLog' ).mockResolvedValue( 200 );
		warn = jest.spyOn( console, 'warn' ).mockImplementation( () => undefined );
		const error = jest.spyOn( console, 'error' ).mockImplementation( () => undefined );
		// A refusal a gateway wrapped in a page of its own: `sendRequest` cannot
		// parse it, so the throttle arrives as a thrown error, not a response body.
		nock( requestURL.origin )
			.post( requestURL.pathname )
			.reply( 403, '{"error":"throttled"}<!-- served by a gateway -->' );

		await expect(
			restAPIClient.createSite( { name: 'fake_blog_name', title: 'fake_blog_title' } )
		).rejects.toThrow( 'Failed to parse JSON' );

		// The policy applies here rather than to whichever test checks next.
		expect( throttleActionHandler ).toHaveBeenCalledWith( 'skip', [ 'signup' ] );

		await flushThrottleWrites();
		error.mockRestore();
	} );
} );
