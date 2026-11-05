/**
 * @jest-environment jsdom
 */

import config from '@automattic/calypso-config';
import nock from 'nock';
import { getBlackboxKey } from 'calypso/blocks/login/utils/blackbox-sdk';
import { getBlackboxSessionId } from 'calypso/blocks/login/utils/get-blackbox-session-id';
import { createAccount } from '../payment-method-helpers';

jest.mock( 'calypso/blocks/login/utils/blackbox-sdk', () => ( {
	...jest.requireActual( 'calypso/blocks/login/utils/blackbox-sdk' ),
	getBlackboxKey: jest.fn( () => ( { apiKey: 'prod-key', keyVersion: 2 } ) ),
} ) );

jest.mock( 'calypso/blocks/login/utils/get-blackbox-session-id', () => ( {
	getBlackboxSessionId: jest.fn().mockResolvedValue( undefined ),
} ) );

function interceptUsersNew( status = 200, responseBody: object = { success: true } ) {
	let requestBody: Record< string, unknown > | undefined;
	nock( 'https://public-api.wordpress.com' )
		.post( '/rest/v1.1/users/new', ( body ) => {
			requestBody = body;
			return true;
		} )
		.reply( status, responseBody );
	return () => requestBody;
}

const createAccountArgs = {
	signupFlowName: 'akismet-userless-checkout',
	email: 'test@example.com',
	siteId: undefined,
	recaptchaClientId: undefined,
};

describe( 'createAccount', () => {
	beforeEach( () => {
		config.enable( 'blackbox' );
		config.enable( 'blackbox-userless-checkout' );
		( getBlackboxKey as jest.Mock ).mockReset();
		( getBlackboxKey as jest.Mock ).mockReturnValue( { apiKey: 'prod-key', keyVersion: 2 } );
		( getBlackboxSessionId as jest.Mock ).mockReset();
		( getBlackboxSessionId as jest.Mock ).mockResolvedValue( undefined );
		delete window.Blackbox;
		nock.cleanAll();
	} );

	it( 'attaches blackbox_session_id and its key version when available', async () => {
		( getBlackboxSessionId as jest.Mock ).mockResolvedValue( 'ABCDEFGHIJKLMNOPQRSTuv' );
		const getRequestBody = interceptUsersNew();

		await createAccount( createAccountArgs );

		expect( getBlackboxSessionId ).toHaveBeenCalledWith( 'prod-key' );
		expect( getRequestBody()?.blackbox_session_id ).toBe( 'ABCDEFGHIJKLMNOPQRSTuv' );
		expect( getRequestBody()?.blackbox_key_version ).toBe( 2 );
	} );

	it( 'omits blackbox_session_id when the api key is missing', async () => {
		( getBlackboxKey as jest.Mock ).mockReturnValue( { apiKey: '', keyVersion: 2 } );
		( getBlackboxSessionId as jest.Mock ).mockResolvedValue( 'ABCDEFGHIJKLMNOPQRSTuv' );
		const getRequestBody = interceptUsersNew();

		await createAccount( createAccountArgs );

		expect( getRequestBody() ).not.toHaveProperty( 'blackbox_session_id' );
		expect( getBlackboxSessionId ).not.toHaveBeenCalled();
	} );

	it( 'omits blackbox_session_id when the userless checkout feature flag is off', async () => {
		config.disable( 'blackbox-userless-checkout' );
		( getBlackboxSessionId as jest.Mock ).mockResolvedValue( 'ABCDEFGHIJKLMNOPQRSTuv' );
		const getRequestBody = interceptUsersNew();

		await createAccount( createAccountArgs );

		expect( getRequestBody() ).not.toHaveProperty( 'blackbox_session_id' );
		expect( getBlackboxSessionId ).not.toHaveBeenCalled();
	} );

	it( 'omits blackbox_session_id when no session is available', async () => {
		const getRequestBody = interceptUsersNew();

		await createAccount( createAccountArgs );

		expect( getRequestBody() ).not.toHaveProperty( 'blackbox_session_id' );
		expect( getRequestBody() ).not.toHaveProperty( 'blackbox_key_version' );
	} );

	it( 'resets Blackbox when account creation fails', async () => {
		const reset = jest.fn();
		window.Blackbox = {
			configure: jest.fn(),
			collect: jest.fn(),
			getSessionId: jest.fn(),
			reset,
		};
		interceptUsersNew( 500, { error: 'internal_server_error', message: 'fail' } );

		await expect( createAccount( createAccountArgs ) ).rejects.toThrow();
		expect( reset ).toHaveBeenCalledTimes( 1 );
	} );
} );
