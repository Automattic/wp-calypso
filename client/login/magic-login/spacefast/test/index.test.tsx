/** @jest-environment jsdom */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginContext } from 'calypso/login/login-context';
import {
	beginSpacefastLogin,
	continueAfterSpacefastCode,
	SpacefastMagicLoginView,
	type SpacefastLoginStartResult,
} from '../index';

jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
	useTranslate: () => ( text: string ) => text,
} ) );

const rejectUnknownUser = async () => {
	throw Object.assign( new Error( 'Unknown user' ), { error: 'unknown_user' } );
};

describe( 'beginSpacefastLogin', () => {
	it( 'emails a code to an existing username without creating an account', async () => {
		const sentCodes: Array< [ string, boolean ] > = [];
		const requestAuthOptions = async () => ( { passwordless: false } );
		const sendLoginCode = async ( identifier: string, createsAccount: boolean ) => {
			sentCodes.push( [ identifier, createsAccount ] );
			return { public_token: 'public-token' };
		};

		await expect(
			beginSpacefastLogin( { identifier: 'existing-user', requestAuthOptions, sendLoginCode } )
		).resolves.toEqual( {
			status: 'code-sent',
			identifier: 'existing-user',
			publicToken: 'public-token',
			createsAccount: false,
		} );
		expect( sentCodes ).toEqual( [ [ 'existing-user', false ] ] );
	} );

	it( 'creates an account and emails a code for an unknown email in one submission', async () => {
		const sentCodes: Array< [ string, boolean ] > = [];
		const requestAuthOptions = rejectUnknownUser;
		const sendLoginCode = async ( identifier: string, createsAccount: boolean ) => {
			sentCodes.push( [ identifier, createsAccount ] );
			return { public_token: 'new-user-token' };
		};

		await expect(
			beginSpacefastLogin( {
				identifier: 'new@example.com',
				requestAuthOptions,
				sendLoginCode,
			} )
		).resolves.toEqual( {
			status: 'code-sent',
			identifier: 'new@example.com',
			publicToken: 'new-user-token',
			createsAccount: true,
		} );
		expect( sentCodes ).toEqual( [ [ 'new@example.com', true ] ] );
	} );

	it( 'asks for an email instead of trying to register an unknown username', async () => {
		const sentCodes: Array< [ string, boolean ] > = [];
		const requestAuthOptions = rejectUnknownUser;
		const sendLoginCode = async ( identifier: string, createsAccount: boolean ) => {
			sentCodes.push( [ identifier, createsAccount ] );
			return { public_token: 'unused' };
		};

		await expect(
			beginSpacefastLogin( { identifier: 'new-user', requestAuthOptions, sendLoginCode } )
		).resolves.toEqual( { status: 'needs-email', username: 'new-user' } );
		expect( sentCodes ).toEqual( [] );
	} );

	it( 'rejects a malformed email before requesting account details', async () => {
		let requestedIdentifier = '';
		const requestAuthOptions = async ( identifier: string ) => {
			requestedIdentifier = identifier;
		};
		const sendLoginCode = async () => ( { public_token: 'unused' } );

		await expect(
			beginSpacefastLogin( {
				identifier: 'person@invalid',
				requestAuthOptions,
				sendLoginCode,
			} )
		).rejects.toThrow( 'invalid_email' );
		expect( requestedIdentifier ).toBe( '' );
	} );
} );

describe( 'continueAfterSpacefastCode', () => {
	it( 'keeps the OAuth redirect in the native 2FA route without rebooting', () => {
		let rebooted = false;
		let navigatedTo = '';
		continueAfterSpacefastCode( {
			twoFactorEnabled: true,
			twoFactorAuthType: 'authenticator',
			redirectTo: 'https://public-api.wordpress.com/oauth2/authorize?client_id=137504&state=abc',
			oauth2ClientId: 137504,
			locale: 'en',
			reboot: () => {
				rebooted = true;
			},
			navigate: ( url ) => {
				navigatedTo = url;
			},
		} );

		const query = new URLSearchParams( navigatedTo.split( '?' )[ 1 ] );
		expect( rebooted ).toBe( false );
		expect( navigatedTo.startsWith( '/log-in/authenticator' ) ).toBe( true );
		expect( query.get( 'client_id' ) ).toBe( '137504' );
		expect( query.get( 'redirect_to' ) ).toContain( 'state=abc' );
	} );

	it( 'reboots into the authorization flow when no second factor is needed', () => {
		let rebooted = false;
		let navigatedTo = '';
		continueAfterSpacefastCode( {
			twoFactorEnabled: false,
			twoFactorAuthType: 'authenticator',
			redirectTo: 'https://public-api.wordpress.com/oauth2/authorize?client_id=137504',
			oauth2ClientId: 137504,
			locale: 'en',
			reboot: () => {
				rebooted = true;
			},
			navigate: ( url ) => {
				navigatedTo = url;
			},
		} );

		expect( rebooted ).toBe( true );
		expect( navigatedTo ).toBe( '' );
	} );
} );

describe( 'SpacefastMagicLoginView', () => {
	const baseProps = {
		locale: 'en',
		oauth2ClientId: 137504,
		redirectTo: 'https://public-api.wordpress.com/oauth2/authorize?client_id=137504',
		isVerifyingCode: false,
		verificationError: null,
		verifyCode: () => {},
	};

	const renderView = (
		beginLogin: ( identifier: string ) => Promise< SpacefastLoginStartResult >,
		props = {}
	) =>
		render(
			<LoginContext.Provider value={ { setHeaders: () => {} } }>
				<SpacefastMagicLoginView { ...baseProps } { ...props } beginLogin={ beginLogin } />
			</LoginContext.Provider>
		);

	it( 'prompts for an email after an unknown username', async () => {
		const submittedIdentifiers: string[] = [];
		const beginLogin = async ( identifier: string ) => {
			submittedIdentifiers.push( identifier );
			return { status: 'needs-email' as const, username: identifier };
		};
		renderView( beginLogin );

		await userEvent.type( screen.getByLabelText( 'Email address or username' ), 'missing-user' );
		await userEvent.click( screen.getByRole( 'button', { name: 'Email me a code' } ) );

		expect( await screen.findByLabelText( 'Email address' ) ).toBeVisible();
		expect( submittedIdentifiers ).toEqual( [ 'missing-user' ] );
	} );

	it( 'keeps the OAuth client and redirect on the native login link', () => {
		const beginLogin = async () => ( { status: 'needs-email', username: 'unused' } ) as const;
		renderView( beginLogin, { initialIdentifier: 'person@example.com' } );

		const href = screen
			.getByRole( 'link', { name: 'Use a password or another method' } )
			.getAttribute( 'href' );
		const url = new URL( href ?? '', 'https://calypso.localhost:3000' );
		expect( url.pathname ).toBe( '/log-in' );
		expect( url.searchParams.get( 'client_id' ) ).toBe( '137504' );
		expect( url.searchParams.get( 'redirect_to' ) ).toBe( baseProps.redirectTo );
	} );

	it( 'accepts a six-character code and authenticates with the public token', async () => {
		const beginLogin = async () =>
			( {
				status: 'code-sent',
				identifier: 'person@example.com',
				publicToken: 'public-token',
				createsAccount: false,
			} ) as const;
		const verifiedTokens: string[] = [];
		const verifyCode = ( token: string ) => {
			verifiedTokens.push( token );
		};
		renderView( beginLogin, { initialIdentifier: 'person@example.com', verifyCode } );

		await userEvent.click( screen.getByRole( 'button', { name: 'Email me a code' } ) );
		const codeInput = await screen.findByLabelText( 'Verification code' );
		await userEvent.type( codeInput, '12a-34b' );
		expect( codeInput ).toHaveValue( '12A34B' );
		await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		await waitFor( () => expect( verifiedTokens ).toEqual( [ 'public-token:MTJBMzRC' ] ) );
	} );

	it( 'shows a resend failure while keeping the code form available', async () => {
		let requestCount = 0;
		const beginLogin = async () => {
			requestCount += 1;
			if ( requestCount > 1 ) {
				throw new Error( 'Please wait before requesting another code.' );
			}
			return {
				status: 'code-sent',
				identifier: 'person@example.com',
				publicToken: 'public-token',
				createsAccount: false,
			} as const;
		};
		renderView( beginLogin, { initialIdentifier: 'person@example.com' } );

		await userEvent.click( screen.getByRole( 'button', { name: 'Email me a code' } ) );
		await userEvent.click( await screen.findByRole( 'button', { name: 'Send another code' } ) );

		expect(
			await screen.findByText( 'Please wait before requesting another code.' )
		).toBeVisible();
		expect( screen.getByLabelText( 'Verification code' ) ).toBeVisible();
	} );
} );
