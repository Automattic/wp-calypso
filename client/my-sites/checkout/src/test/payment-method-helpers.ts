/**
 * @jest-environment jsdom
 */

import config from '@automattic/calypso-config';
import nock from 'nock';
import { getBlackboxSessionId } from 'calypso/blocks/login/utils/get-blackbox-session-id';
import { createAccount } from '../payment-method-helpers';

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
		config.enable( 'blackbox-signup' );
		( getBlackboxSessionId as jest.Mock ).mockReset();
		( getBlackboxSessionId as jest.Mock ).mockResolvedValue( undefined );
		delete window.Blackbox;
		nock.cleanAll();
	} );

	it( 'attaches blackbox_session_id when available', async () => {
		( getBlackboxSessionId as jest.Mock ).mockResolvedValue( 'ABCDEFGHIJKLMNOPQRSTuv' );
		const getRequestBody = interceptUsersNew();

		await createAccount( createAccountArgs );

		expect( getRequestBody()?.blackbox_session_id ).toBe( 'ABCDEFGHIJKLMNOPQRSTuv' );
	} );

	it( 'omits blackbox_session_id when the signup feature flag is off', async () => {
		config.disable( 'blackbox-signup' );
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
	} );

	it( 'resets Blackbox when account creation fails', async () => {
		window.Blackbox = { reset: jest.fn() };
		interceptUsersNew( 500, { error: 'internal_server_error', message: 'fail' } );

		await expect( createAccount( createAccountArgs ) ).rejects.toThrow();
		expect( window.Blackbox.reset ).toHaveBeenCalledTimes( 1 );
	} );
} );
