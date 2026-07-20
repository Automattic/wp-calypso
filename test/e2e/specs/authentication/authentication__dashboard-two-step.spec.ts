import { DataHelper, NewUserResponse, RestAPIClient, TOTPClient } from '@automattic/calypso-e2e';
import { snoozeAccountRecoveryInterstitial } from '../../lib/dashboard-helpers';
import { expect, tags, test } from '../../lib/pw-base';
import {
	apiCloseAccount,
	apiWaitForBearerTokenAcceptance,
	apiWaitForEmailVerification,
} from '../shared';
import type { LoginPage } from '@automattic/calypso-e2e';
import type { CDPSession, Page } from 'playwright';

/**
 * Navigates to the WordPress.com login page (redirecting to the dashboard on
 * success) and submits the username and password. For an account with two-step
 * authentication enabled this lands on the relevant second-factor screen.
 */
async function logInWithPassword(
	page: Page,
	pageLogin: LoginPage,
	username: string,
	password: string
): Promise< void > {
	await page.goto(
		DataHelper.getCalypsoURL( 'log-in', {
			redirect_to: DataHelper.getDashboardURL( '/me/security/two-step-auth' ),
		} )
	);
	await pageLogin.logInWithCredentials( username, password );
}

/**
 * Returns a TOTP code that differs from the previously used one so the login
 * step never replays a code the enable step already consumed. Codes rotate
 * every 30 seconds, so at most one window (~35s) is ever waited out.
 */
async function getUnusedTOTPCode(
	page: Page,
	totpClient: TOTPClient,
	previousCode: string
): Promise< string > {
	let code = totpClient.getToken();
	const deadline = Date.now() + 35_000;
	while ( code === previousCode && Date.now() < deadline ) {
		await page.waitForTimeout( 3_000 );
		code = totpClient.getToken();
	}
	return code;
}

/**
 * Submits authenticator codes at the login second-factor screen until the login
 * proceeds. A code an earlier step already consumed lands in the same 30s window
 * and reads as invalid, so this rotates to the next code on rejection and fails
 * fast rather than hanging on `submitVerificationCode`'s open-ended navigation wait.
 */
async function submitLoginTOTPCode(
	page: Page,
	pageLogin: LoginPage,
	totpSecret: string,
	previousCode: string
): Promise< void > {
	const totpClient = new TOTPClient( totpSecret );
	for ( let attempt = 0; attempt < 3; attempt++ ) {
		const code = await getUnusedTOTPCode( page, totpClient, previousCode );
		previousCode = code;
		await pageLogin.fillVerificationCode( code );
		await pageLogin.clickSubmit();
		const proceeded = await page
			.waitForURL( ( url ) => ! url.pathname.includes( '/log-in' ), { timeout: 15_000 } )
			.then( () => true )
			.catch( () => false );
		if ( proceeded ) {
			return;
		}
	}
	throw new Error(
		`Login second-factor code was not accepted after retries; still at ${ page.url() }.`
	);
}

/**
 * Completes the security-key second factor at login. With both a TOTP app and a
 * security key registered, the login flow may default to either method, so this
 * switches to the security-key form when needed. The form auto-initiates the
 * WebAuthn ceremony on mount; the CDP virtual authenticator answers it
 * automatically, but the button is nudged in case the auto-start needs a gesture.
 */
async function continueWithSecurityKey( page: Page ): Promise< void > {
	const switchToSecurityKey = page.getByRole( 'button', {
		name: /Continue with your security.key/,
	} );
	const canSwitchToSecurityKey = await switchToSecurityKey.isVisible();
	if ( canSwitchToSecurityKey ) {
		await switchToSecurityKey.click();
	}

	const continueButton = page.getByRole( 'button', { name: 'Continue with security key' } );
	const isContinueButtonVisible = await continueButton.isVisible();
	if ( isContinueButtonVisible ) {
		await continueButton.click();
	}

	await page.waitForURL( ( url ) => ! url.pathname.includes( '/log-in' ), { timeout: 30_000 } );
}

/**
 * Answers the two-step reauthentication challenge once, as a user would: a fresh
 * authenticator code typed in and verified. Opening the security area with a
 * freshly two-step-enabled session bounces to the classic Calypso
 * `me/reauth-required` screen, keyed here on its "Not you? Log out" control. No-op
 * (returns an empty string) when the challenge is absent. Returns the code it
 * submitted so the caller can avoid replaying it on the next attempt (the endpoint
 * rejects a code already consumed within its 30s window).
 */
async function satisfyReauthChallenge(
	page: Page,
	totpSecret: string,
	previousCode: string
): Promise< string > {
	const logOut = page.getByText( 'Not you? Log out' );
	if ( ! ( await logOut.isVisible() ) ) {
		return '';
	}
	const code = await getUnusedTOTPCode( page, new TOTPClient( totpSecret ), previousCode );
	await page.getByLabel( 'Verification code' ).fill( code );
	await page.getByRole( 'button', { name: 'Verify' } ).click();
	await logOut.waitFor( { state: 'hidden', timeout: 15_000 } ).catch( () => undefined );
	return code;
}

/**
 * Asserts that the current session is authenticated and has two-step
 * authentication enabled: the dashboard's two-step-auth screen is a
 * behind-login route that only renders the "Register key" control once
 * `two_step_enabled` is true.
 */
async function assertTwoStepEnabledAndLoggedIn( page: Page, totpSecret: string ): Promise< void > {
	await page.goto( DataHelper.getDashboardURL( '/me/security/two-step-auth' ) );
	const registerKeyButton = page.getByRole( 'button', { name: 'Register key' } );
	// Opening the security area can bounce to the reauth challenge, sometimes only
	// after briefly rendering the settings, and it can prompt again, so keep
	// answering it until the settings actually render.
	let previousCode = '';
	await expect( async () => {
		const code = await satisfyReauthChallenge( page, totpSecret, previousCode );
		if ( code ) {
			previousCode = code;
		}
		await expect( registerKeyButton ).toBeVisible( { timeout: 3_000 } );
	} ).toPass( { timeout: 90_000 } );
}

test.describe(
	'Dashboard: Two-step authentication registration and login',
	{ tag: [ tags.AUTHENTICATION ] },
	() => {
		test.describe.configure( { mode: 'serial' } );

		// The test drives the Multi-site Dashboard's `/me` two-step-auth screens,
		// which are served from DASHBOARD_BASE_URL (my.wordpress.com in production),
		// so gate on that origin rather than the Calypso login origin.
		test.skip(
			new URL( DataHelper.getDashboardURL() ).hostname !== 'my.wordpress.com',
			'Skipping unless the Multi-site Dashboard is served from my.wordpress.com'
		);

		const testUser = DataHelper.getNewTestUser( {
			useMailosaur: true,
			usernamePrefix: 'twostep',
		} );
		const securityKeyName = `e2e-security-key-${ testUser.username }`;

		let newUserDetails: NewUserResponse | undefined;
		let restAPIClient: RestAPIClient | undefined;

		test.afterAll( async () => {
			if ( ! restAPIClient || ! newUserDetails ) {
				return;
			}
			await apiCloseAccount( restAPIClient, {
				userID: newUserDetails.body.user_id,
				username: newUserDetails.body.username,
				email: testUser.email,
			} );
		} );

		test( 'As a new user, I can register a TOTP app and a security key in the dashboard and log in with each', async ( {
			page,
			pageLogin,
			pageUserSignUp,
			clientEmail,
		}, workerInfo ) => {
			test.skip(
				workerInfo.project.name !== 'authentication',
				'The authentication project is the only one that has the right browser settings for authentication tests.'
			);

			// Signup, email verification and two full login cycles (with the
			// authentication project's slowMo) run well past the default per-test
			// timeout.
			test.setTimeout( 8 * 60 * 1000 );

			let totpSecret = '';
			let enableCode = '';
			let cdpSession: CDPSession | undefined;

			await test.step( 'Given I sign up for a new WordPress.com account', async function () {
				await pageLogin.visit();
				await pageLogin.clickCreateNewAccount();
				newUserDetails = await pageUserSignUp.signupSocialFirstWithEmail( testUser.email );

				restAPIClient = new RestAPIClient(
					{ username: testUser.username, password: testUser.password },
					newUserDetails.body.bearer_token
				);
				await apiWaitForBearerTokenAcceptance( restAPIClient, testUser.email );
			} );

			await test.step( 'And I verify my email address', async function () {
				const message = await clientEmail.getLastMatchingMessage( {
					inboxId: testUser.inboxId,
					sentTo: testUser.email,
					subject: 'Activate',
				} );
				const links = await clientEmail.getLinksFromMessage( message );
				const activationLink = links.find( ( link ) => link.includes( 'activate' ) ) as string;
				await page.goto( activationLink );
				await apiWaitForEmailVerification( restAPIClient!, testUser.email );

				// A fresh account has no recovery method, so the dashboard's
				// account-recovery interstitial would otherwise mount over every route
				// and block the screens this test drives.
				await snoozeAccountRecoveryInterstitial( restAPIClient! );
			} );

			await test.step( 'When I set up an authenticator app in the dashboard', async function () {
				const setupResponsePromise = page.waitForResponse(
					( response ) =>
						response.url().includes( '/me/two-step/app-auth-setup' ) &&
						response.request().method() === 'GET' &&
						response.ok()
				);
				await page.goto( DataHelper.getDashboardURL( '/me/security/two-step-auth/app' ) );

				const setupResponse = await setupResponsePromise;
				// wpcom-proxy-request replies in http_envelope form, so the payload is
				// under `body` and the transport is 200 regardless of the inner status.
				const { code, body } = await setupResponse.json();
				expect( code ).toBe( 200 );
				// time_code is the secret space-grouped; strip it for TOTPClient's base32 decoder.
				totpSecret = body.time_code.replace( /\s/g, '' );
				expect( totpSecret ).toBeTruthy();

				enableCode = new TOTPClient( totpSecret ).getToken();
				await page.getByPlaceholder( '123456' ).fill( enableCode );
				await page.getByRole( 'button', { name: 'Enable' } ).click();
			} );

			await test.step( 'Then two-step authentication is enabled', async function () {
				await assertTwoStepEnabledAndLoggedIn( page, totpSecret );
			} );

			await test.step( 'When I log out and log in again using a TOTP code', async function () {
				// signupSocialFirstWithEmail creates a passwordless account, so a
				// password login has no field to fill. Set the generated password
				// (which must be the only setting in the request) here, right before
				// logging out: changing it invalidates the signup session that the
				// enable and assert steps above rely on, so it cannot be done earlier.
				await restAPIClient!.setMySettings( { password: testUser.password } );
				await page.context().clearCookies();
				await logInWithPassword(
					page,
					pageLogin,
					newUserDetails!.body.username,
					testUser.password
				);

				await submitLoginTOTPCode( page, pageLogin, totpSecret, enableCode );
			} );

			await test.step( 'Then I am logged in with the TOTP app', async function () {
				await assertTwoStepEnabledAndLoggedIn( page, totpSecret );
			} );

			await test.step( 'When I register a security key in the dashboard', async function () {
				// A CDP virtual authenticator answers the WebAuthn ceremonies for both
				// registration and, later, login. It persists on the browser context
				// until the context closes, so it survives the logout below.
				cdpSession = await page.context().newCDPSession( page );
				await cdpSession.send( 'WebAuthn.enable' );
				await cdpSession.send( 'WebAuthn.addVirtualAuthenticator', {
					options: {
						protocol: 'ctap2',
						transport: 'internal',
						hasResidentKey: true,
						hasUserVerification: true,
						isUserVerified: true,
						automaticPresenceSimulation: true,
					},
				} );

				await page.goto( DataHelper.getDashboardURL( '/me/security/two-step-auth' ) );
				await page.getByRole( 'button', { name: 'Register key' } ).click();
				await page.getByRole( 'textbox', { name: 'Security key name' } ).fill( securityKeyName );
				await page.getByRole( 'button', { name: 'Add key' } ).click();
			} );

			await test.step( 'Then the security key is added', async function () {
				await expect( page.getByText( securityKeyName ).first() ).toBeVisible();
			} );

			await test.step( 'When I log out and log in again using the security key', async function () {
				await page.context().clearCookies();
				await logInWithPassword(
					page,
					pageLogin,
					newUserDetails!.body.username,
					testUser.password
				);
				await continueWithSecurityKey( page );
			} );

			await test.step( 'Then I am logged in with the security key', async function () {
				await assertTwoStepEnabledAndLoggedIn( page, totpSecret );
			} );
		} );
	}
);
