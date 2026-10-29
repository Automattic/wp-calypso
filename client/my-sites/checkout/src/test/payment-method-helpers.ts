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

	it.each( [
		{ response: { user_id: 123 }, newUserId: 123 },
		{ response: { signup_sandbox_user_id: 456 }, newUserId: 456 },
		{ response: {}, newUserId: undefined },
	] )( 'marks the new account for signup analytics: %j', async ( { response, newUserId } ) => {
		interceptUsersNew( 200, { success: true, ...response } );

		await createAccount( createAccountArgs );

		expect( jest.mocked( setSignupIsNewUser ).mock.calls ).toEqual(
			newUserId ? [ [ newUserId ] ] : []
		);
	} );

	it.each( [
		{ flow: 'static-site-import', response: { blog_details: { blogid: '123' } }, siteId: '123' },
		{ flow: 'static-site-import', response: {}, siteId: undefined },
		{ flow: 'onboarding', response: { blog_details: { blogid: '123' } }, siteId: undefined },
	] )(
		'remembers the created site for the static site import flow: %j',
		async ( { flow, response, siteId } ) => {
			jest.mocked( getSignupCompleteFlowName ).mockReturnValue( flow );
			interceptUsersNew( 200, { success: true, ...response } );

			await createAccount( createAccountArgs );

			expect( jest.mocked( setSignupCompleteSiteID ).mock.calls ).toEqual(
				siteId ? [ [ siteId ] ] : []
			);
		}
	);

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
