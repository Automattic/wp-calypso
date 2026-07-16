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
 * Asserts that the current session is authenticated and has two-step
 * authentication enabled: the dashboard's two-step-auth screen is a
 * behind-login route that only renders the "Register key" control once
 * `two_step_enabled` is true.
 */
async function assertTwoStepEnabledAndLoggedIn( page: Page ): Promise< void > {
	await page.goto( DataHelper.getDashboardURL( '/me/security/two-step-auth' ) );
	await expect( page.getByRole( 'button', { name: 'Register key' } ) ).toBeVisible();
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
				totpSecret = ( await setupResponse.json() ).time_code;
				expect( totpSecret ).toBeTruthy();

				enableCode = new TOTPClient( totpSecret ).getToken();
				await page.getByPlaceholder( '123456' ).fill( enableCode );
				await page.getByRole( 'button', { name: 'Enable' } ).click();
			} );

			await test.step( 'Then two-step authentication is enabled', async function () {
				await assertTwoStepEnabledAndLoggedIn( page );
			} );

			await test.step( 'When I log out and log in again using a TOTP code', async function () {
				await page.context().clearCookies();
				await logInWithPassword(
					page,
					pageLogin,
					newUserDetails!.body.username,
					testUser.password
				);

				const code = await getUnusedTOTPCode( page, new TOTPClient( totpSecret ), enableCode );
				await pageLogin.submitVerificationCode( code );
			} );

			await test.step( 'Then I am logged in with the TOTP app', async function () {
				await assertTwoStepEnabledAndLoggedIn( page );
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
				await assertTwoStepEnabledAndLoggedIn( page );
			} );
		} );
	}
);
