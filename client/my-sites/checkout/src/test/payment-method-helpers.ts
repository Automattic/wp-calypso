/**
 * @jest-environment jsdom
 */

import config from '@automattic/calypso-config';
import nock from 'nock';
import { getBlackboxApiKey } from 'calypso/blocks/login/utils/blackbox-sdk';
import { getBlackboxSessionId } from 'calypso/blocks/login/utils/get-blackbox-session-id';
import {
	getSignupCompleteFlowName,
	setSignupCompleteSiteID,
	setSignupIsNewUser,
} from 'calypso/signup/storageUtils';
import { createAccount } from '../payment-method-helpers';

jest.mock( 'calypso/blocks/login/utils/blackbox-sdk', () => ( {
	getBlackboxApiKey: jest.fn( () => 'signup-key' ),
} ) );

jest.mock( 'calypso/blocks/login/utils/get-blackbox-session-id', () => ( {
	getBlackboxSessionId: jest.fn().mockResolvedValue( undefined ),
} ) );

jest.mock( 'calypso/signup/storageUtils', () => ( {
	getSignupCompleteFlowName: jest.fn(),
	setSignupCompleteSiteID: jest.fn(),
	setSignupIsNewUser: jest.fn(),
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
		jest.mocked( getSignupCompleteFlowName ).mockReset();
		jest.mocked( setSignupCompleteSiteID ).mockClear();
		( setSignupIsNewUser as jest.Mock ).mockClear();
		config.enable( 'blackbox' );
		config.enable( 'blackbox-userless-checkout' );
		( getBlackboxApiKey as jest.Mock ).mockReset();
		( getBlackboxApiKey as jest.Mock ).mockReturnValue( 'signup-key' );
		( getBlackboxSessionId as jest.Mock ).mockReset();
		( getBlackboxSessionId as jest.Mock ).mockResolvedValue( undefined );
		delete window.Blackbox;
		nock.cleanAll();
	} );

	it( 'marks the newly created account for signup analytics', async () => {
		interceptUsersNew( 200, { success: true, user_id: 123 } );

		await createAccount( createAccountArgs );

		expect( setSignupIsNewUser ).toHaveBeenCalledWith( 123 );
	} );

	it( 'uses the sandbox user ID when marking the newly created account', async () => {
		interceptUsersNew( 200, { success: true, signup_sandbox_user_id: 456 } );

		await createAccount( createAccountArgs );

		expect( setSignupIsNewUser ).toHaveBeenCalledWith( 456 );
	} );

	it( 'does not mark an account without a user ID', async () => {
		interceptUsersNew();

		await createAccount( createAccountArgs );

		expect( setSignupIsNewUser ).not.toHaveBeenCalled();
	} );

	it( 'retains the migration destination before payment is attempted', async () => {
		jest.mocked( getSignupCompleteFlowName ).mockReturnValue( 'static-site-import' );
		interceptUsersNew( 200, { success: true, blog_details: { blogid: '123' } } );

		await createAccount( createAccountArgs );

		expect( setSignupCompleteSiteID ).toHaveBeenCalledWith( '123' );
	} );

	it( 'does not replace the migration destination when an account-creation retry returns no site', async () => {
		jest.mocked( getSignupCompleteFlowName ).mockReturnValue( 'static-site-import' );
		interceptUsersNew();

		await createAccount( { ...createAccountArgs, siteId: 123 } );

		expect( setSignupCompleteSiteID ).not.toHaveBeenCalled();
	} );

	it( 'does not persist a migration destination for other checkout flows', async () => {
		jest.mocked( getSignupCompleteFlowName ).mockReturnValue( 'onboarding' );
		interceptUsersNew( 200, { success: true, blog_details: { blogid: '123' } } );

		await createAccount( createAccountArgs );

		expect( setSignupCompleteSiteID ).not.toHaveBeenCalled();
	} );

	it( 'attaches blackbox_session_id when available', async () => {
		( getBlackboxSessionId as jest.Mock ).mockResolvedValue( 'ABCDEFGHIJKLMNOPQRSTuv' );
		const getRequestBody = interceptUsersNew();

		await createAccount( createAccountArgs );

		expect( getBlackboxApiKey ).toHaveBeenCalledWith( 'blackbox-userless-checkout' );
		expect( getBlackboxSessionId ).toHaveBeenCalledWith( 'signup-key' );
		expect( getRequestBody()?.blackbox_session_id ).toBe( 'ABCDEFGHIJKLMNOPQRSTuv' );
	} );

	it( 'omits blackbox_session_id when the signup api key is missing', async () => {
		( getBlackboxApiKey as jest.Mock ).mockReturnValue( '' );
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
