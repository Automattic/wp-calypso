/**
 * @jest-environment jsdom
 */
import { loadScript } from '@automattic/load-script';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import wpcomRequest from 'wpcom-proxy-request';
import { postLoginRequest } from 'calypso/state/login/utils';
import { GoogleSocialButton } from '../google';

jest.mock( '@automattic/calypso-config', () =>
	Object.assign(
		( key ) =>
			( {
				google_oauth_client_id: 'test-google-client',
				wpcom_signup_id: 'test-wpcom-client',
				wpcom_signup_key: 'test-wpcom-key',
			} )[ key ],
		{ isEnabled: () => false }
	)
);
jest.mock( '@automattic/load-script', () => ( { loadScript: jest.fn() } ) );
jest.mock( 'wpcom-proxy-request', () => ( { __esModule: true, default: jest.fn() } ) );
jest.mock( 'calypso/state/login/utils', () => ( {
	...jest.requireActual( 'calypso/state/login/utils' ),
	postLoginRequest: jest.fn(),
} ) );

describe( 'GoogleSocialButton', () => {
	let props;
	let requestCode;
	let initCodeClient;
	let providerResponse;

	beforeEach( () => {
		jest.resetAllMocks();
		props = {
			recordTracksEvent: jest.fn(),
			responseHandler: jest.fn(),
			showErrorNotice: jest.fn(),
			translate: ( text ) => text,
			uxMode: 'popup',
			startingPoint: 'login',
		};
		providerResponse = { code: 'test-code', state: 'test-state' };
		requestCode = jest.fn( () => initCodeClient.mock.calls[ 0 ][ 0 ].callback( providerResponse ) );
		initCodeClient = jest.fn( () => ( { requestCode } ) );
		window.google = { accounts: { oauth2: { initCodeClient } } };
		wpcomRequest.mockResolvedValue( { nonce: 'test-nonce' } );
		postLoginRequest.mockResolvedValue( {
			body: { data: { access_token: 'test-access-token', id_token: 'test-id-token' } },
		} );
	} );

	afterEach( () => {
		delete window.google;
	} );

	test( 'passes the nonce to Google and exchanges the callback code before handing off tokens', async () => {
		let completeExchange;
		postLoginRequest.mockReturnValue(
			new Promise( ( resolve ) => {
				completeExchange = resolve;
			} )
		);
		render( <GoogleSocialButton { ...props } /> );
		await userEvent.click( screen.getByRole( 'button' ) );

		expect( wpcomRequest ).toHaveBeenCalledWith( {
			path: '/generate-authorization-nonce',
			apiNamespace: 'wpcom/v2',
			method: 'GET',
		} );
		expect( initCodeClient ).toHaveBeenCalledWith(
			expect.objectContaining( {
				client_id: 'test-google-client',
				scope: 'openid profile email',
				state: 'test-nonce',
				ux_mode: 'popup',
			} )
		);
		await waitFor( () =>
			expect( postLoginRequest ).toHaveBeenCalledWith(
				'exchange-social-auth-code',
				expect.objectContaining( {
					service: 'google',
					auth_code: 'test-code',
					state: 'test-state',
				} )
			)
		);
		expect( props.responseHandler ).not.toHaveBeenCalled();
		completeExchange( {
			body: { data: { access_token: 'test-access-token', id_token: 'test-id-token' } },
		} );
		await waitFor( () =>
			expect( props.responseHandler ).toHaveBeenCalledWith( {
				service: 'google',
				access_token: 'test-access-token',
				id_token: 'test-id-token',
			} )
		);
	} );

	test( 'loads the Google SDK on first use and hands off the exchanged tokens', async () => {
		delete window.google;
		loadScript.mockImplementation( async () => {
			window.google = { accounts: { oauth2: { initCodeClient } } };
		} );
		render( <GoogleSocialButton { ...props } /> );
		await userEvent.click( screen.getByRole( 'button' ) );

		expect( loadScript ).toHaveBeenCalledWith( 'https://accounts.google.com/gsi/client' );
		await waitFor( () =>
			expect( props.responseHandler ).toHaveBeenCalledWith( {
				service: 'google',
				access_token: 'test-access-token',
				id_token: 'test-id-token',
			} )
		);
	} );

	test( 'exchanges a redirected authorization code with its state and redirect URI', async () => {
		render(
			<GoogleSocialButton
				{ ...props }
				authCodeFromRedirect="redirect-code"
				serviceFromRedirect="google"
				redirectUri="https://example.test/log-in"
				state="redirect-state"
			/>
		);

		expect( postLoginRequest ).toHaveBeenCalledWith(
			'exchange-social-auth-code',
			expect.objectContaining( {
				auth_code: 'redirect-code',
				state: 'redirect-state',
				redirect_uri: 'https://example.test/log-in',
			} )
		);
		await waitFor( () =>
			expect( props.responseHandler ).toHaveBeenCalledWith( {
				service: 'google',
				access_token: 'test-access-token',
				id_token: 'test-id-token',
			} )
		);
	} );

	test( 'does not exchange codes or hand off tokens when Google rejects authorization', async () => {
		providerResponse = { error: 'access_denied' };
		render( <GoogleSocialButton { ...props } /> );
		await userEvent.click( screen.getByRole( 'button' ) );

		await waitFor( () =>
			expect( props.recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_social_button_failure',
				expect.objectContaining( { error_code: 'access_denied' } )
			)
		);
		expect( postLoginRequest ).not.toHaveBeenCalled();
		expect( props.responseHandler ).not.toHaveBeenCalled();
	} );

	test( 'shows an exchange error without handing off tokens', async () => {
		postLoginRequest.mockRejectedValue( {
			status: 400,
			response: { body: { data: { errors: [ { code: 'invalid_nonce' } ] } } },
		} );
		render( <GoogleSocialButton { ...props } /> );
		await userEvent.click( screen.getByRole( 'button' ) );

		await waitFor( () =>
			expect( props.showErrorNotice ).toHaveBeenCalledWith(
				'Something went wrong when trying to connect with Google. Please try again.'
			)
		);
		expect( props.responseHandler ).not.toHaveBeenCalled();
	} );

	test( 'shows a loading error without requesting authorization when the SDK is unavailable', async () => {
		delete window.google;
		loadScript.mockRejectedValue( new Error( 'SDK unavailable' ) );
		render( <GoogleSocialButton { ...props } /> );
		await userEvent.click( screen.getByRole( 'button' ) );

		await waitFor( () =>
			expect( props.showErrorNotice ).toHaveBeenCalledWith(
				'Something went wrong while trying to load Google sign-in.'
			)
		);
	} );

	test( 'shows a nonce error without requesting authorization or handing off tokens', async () => {
		wpcomRequest.mockRejectedValue( new Error( 'Nonce unavailable' ) );
		render( <GoogleSocialButton { ...props } /> );
		await userEvent.click( screen.getByRole( 'button' ) );

		await waitFor( () =>
			expect( props.showErrorNotice ).toHaveBeenCalledWith(
				'Error fetching nonce or initializing Google sign-in. Please try again.'
			)
		);
		expect( requestCode ).not.toHaveBeenCalled();
		expect( postLoginRequest ).not.toHaveBeenCalled();
		expect( props.responseHandler ).not.toHaveBeenCalled();
	} );
} );
