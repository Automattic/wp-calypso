/**
 * @vitest-environment jsdom
 */

import config from '@automattic/calypso-config';
import nock from 'nock';
import { type Mock, vi } from 'vitest';
import { getBlackboxApiKey } from 'calypso/blocks/login/utils/blackbox-sdk';
import { getBlackboxSessionId } from 'calypso/blocks/login/utils/get-blackbox-session-id';
import { createAccount } from '../payment-method-helpers';

vi.mock( 'calypso/blocks/login/utils/blackbox-sdk', () => ( {
	getBlackboxApiKey: vi.fn( () => 'blackbox-api-key' ),
} ) );

vi.mock( 'calypso/blocks/login/utils/get-blackbox-session-id', () => ( {
	getBlackboxSessionId: vi.fn().mockResolvedValue( undefined ),
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
		( getBlackboxApiKey as Mock ).mockReset();
		( getBlackboxApiKey as Mock ).mockReturnValue( 'blackbox-api-key' );
		( getBlackboxSessionId as Mock ).mockReset();
		( getBlackboxSessionId as Mock ).mockResolvedValue( undefined );
		delete window.Blackbox;
		nock.cleanAll();
	} );

	it( 'cancels account creation when checkout becomes inactive', async () => {
		( getBlackboxSessionId as Mock ).mockResolvedValue( null );
		const getRequestBody = interceptUsersNew();
		await expect( createAccount( createAccountArgs ) ).rejects.toMatchObject( {
			name: 'AbortError',
		} );
		expect( getRequestBody() ).toBeUndefined();
	} );

	it( 'attaches blackbox_session_id when available', async () => {
		( getBlackboxSessionId as Mock ).mockResolvedValue( 'ABCDEFGHIJKLMNOPQRSTuv' );
		const getRequestBody = interceptUsersNew();

		await createAccount( createAccountArgs );

		expect( getBlackboxSessionId ).toHaveBeenCalledWith( 'blackbox-api-key', undefined, 'signup' );
		expect( getRequestBody()?.blackbox_session_id ).toBe( 'ABCDEFGHIJKLMNOPQRSTuv' );
	} );

	it( 'omits blackbox_session_id when the Blackbox api key is missing', async () => {
		( getBlackboxApiKey as Mock ).mockReturnValue( '' );
		( getBlackboxSessionId as Mock ).mockResolvedValue( 'ABCDEFGHIJKLMNOPQRSTuv' );
		const getRequestBody = interceptUsersNew();

		await createAccount( createAccountArgs );

		expect( getRequestBody() ).not.toHaveProperty( 'blackbox_session_id' );
		expect( getBlackboxSessionId ).not.toHaveBeenCalled();
	} );

	it( 'omits blackbox_session_id when the userless checkout feature flag is off', async () => {
		config.disable( 'blackbox-userless-checkout' );
		( getBlackboxSessionId as Mock ).mockResolvedValue( 'ABCDEFGHIJKLMNOPQRSTuv' );
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
		const reset = vi.fn();
		window.Blackbox = {
			configure: vi.fn(),
			collect: vi.fn(),
			getSessionId: vi.fn(),
			flush: vi.fn(),
			getSnapshot: vi.fn(),
			subscribe: vi.fn(),
			reset,
		};
		interceptUsersNew( 500, { error: 'internal_server_error', message: 'fail' } );

		await expect( createAccount( createAccountArgs ) ).rejects.toThrow();
		expect( reset ).toHaveBeenCalledTimes( 1 );
	} );
} );
