/**
 * @group calypso-release
 *
 * Google blocks Chrome-based browsers that are controlled via automation
 * from performing login to their services.
 * The workaround is to use a non-Google browser, such as Firefox.
 * See: https://stackoverflow.com/questions/66209119/automation-google-login-with-python-and-selenium-shows-this-browser-or-app-may
 *
 * @browser firefox
 */

import {
	SecretsManager,
	GoogleLoginPage,
	// TOTPClient,
	DataHelper,
	UserSignupPage,
	envVariables,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { skipDescribeIf } from '../../jest-helpers';

declare const browser: Browser;

skipDescribeIf(
	// We can only run this spec for wordpress.com or wpcalypso.wordpress.com because only these two are allowed to use Google login.
	! [ 'https://wordpress.com', 'https://wpcalypso.wordpress.com' ].includes(
		envVariables.CALYPSO_BASE_URL
	)
)(
	DataHelper.createSuiteTitle( 'Signup: WordPress.com WPCC > WooCommerce via Google' ),
	function () {
		const credentials = SecretsManager.secrets.testAccounts.googleLoginUser;
		let page: Page;
		let googlePopupPage: Page;
		let userSignupPage: UserSignupPage;
		let googleLoginPage: GoogleLoginPage;
		// let totpClient: TOTPClient;

		// let windowClosed: boolean;
		// let code: string;

		beforeAll( async () => {
			page = await browser.newPage();
			userSignupPage = new UserSignupPage( page );
		} );

		describe( 'Signup via /start/wpcc', function () {
			it( 'Navigate to WooCommerce WPCC endpoint', async function () {
				const calypsoBaseURL = DataHelper.getCalypsoURL();
				const wooAuthPath = SecretsManager.secrets.wooSignupPath;
				await page.goto( calypsoBaseURL + wooAuthPath );
			} );

			it( 'Click on "Continue with Google" button', async function () {
				googlePopupPage = await userSignupPage.clickContinueWithGoogle();
				await googlePopupPage.waitForURL( /accounts\.google\.com/ );
			} );

			it( 'Enter Google username', async function () {
				await googlePopupPage.waitForURL( /identifier/ );

				googleLoginPage = new GoogleLoginPage( googlePopupPage );
				await googleLoginPage.enterUsername( credentials.username );
				await googleLoginPage.clickButton( 'Next' );
			} );
		} );

		// TODO: This test needs to be updated. There is a new recaptcha screen from google that needs to be handled
		// handled before a password can be entered p1719199948669409/1719199255.061099-slack-C02DQP0FP
		// 	it( 'Enter Google password', async function () {
		// 		await googlePopupPage.waitForURL( /challenge/ );

		// 		await googleLoginPage.enterPassword( credentials.password );
		// 		await googleLoginPage.clickButton( 'Next' );
		// 	} );

		// 	it( 'Enter 2FA challenge if required - Challenge 1', async function () {
		// 		// Add a handler that will detect whether the popup page
		// 		// has closed.
		// 		// The popup being closed/dismissed signifies the login
		// 		// process was successful.
		// 		// This handler, like all other "page.on"-type handlers
		// 		// will persist for the lifetime of the thread.
		// 		// In other words, this handler will remain active until
		// 		// the Jest process is terminated.
		// 		googlePopupPage.on( 'close', () => {
		// 			windowClosed = true;
		// 		} );

		// 		try {
		// 			// Separately from above, create a promise that will
		// 			// resolve once the popup page closes.
		// 			// This promise is then awaited on to see if it will
		// 			// resolve after the TOTP code is entered.
		// 			const googlePopupPageClosePromise = googlePopupPage.waitForEvent( 'close' );

		// 			totpClient = new TOTPClient( credentials.totpKey as string );
		// 			code = totpClient.getToken();

		// 			await googleLoginPage.enter2FACode( code );
		// 			await googleLoginPage.clickButton( 'Next' );

		// 			// If the promise resolves (ie. popup closes) then
		// 			// the TOTP was accepted AND the login is successful.
		// 			await googlePopupPageClosePromise;
		// 		} catch {
		// 			console.log( 'Expecting second 2FA challenge.' );
		// 			// noop
		// 			//
		// 			// If `googlePopupPageClosePromise` rejects, it means
		// 			// the popup did not close.
		// 			// This in turn means the TOTP was rejected, or
		// 			// the unique circumstance we see (below) has come into play.
		// 		}
		// 	} );

		// 	// In a game of cat and mouse, Google now appears to require
		// 	// two 2FA challege for our `googleLoginUser` account.
		// 	// It is not known why, but the most likely explanation is that
		// 	// this spec has tripped something in the Google backend.
		// 	// The result being the user is required to enter two sets of
		// 	// TOTP codes, and because the TOTP codes regenerate every 30s
		// 	// this means the spec has to wait until the TOTP code updates.
		// 	// This behavior was confirmed manually by @worldomonation as well.
		// 	it( 'Enter 2FA challenge if required - Challenge 2', async function () {
		// 		if ( windowClosed ) {
		// 			return;
		// 		}

		// 		// Check if the second 2FA challenge is present.
		// 		const isSecondChallengePresent =
		// 			await googleLoginPage.isVisible( 'text="Verify it’s you"' );

		// 		if ( ! isSecondChallengePresent ) {
		// 			return;
		// 		}

		// 		// Wait until the TOTP code generated by the client
		// 		// changes, meaning the 30s window has rolled over.
		// 		while ( totpClient.getToken() === code ) {
		// 			console.log(
		// 				`Google Authentication: second 2FA challenge encountered, waiting for TOTP code to change from ${ code }`
		// 			);
		// 			await new Promise( ( resolve ) => setTimeout( resolve, 1000 ) );
		// 		}

		// 		await googleLoginPage.enter2FACode( totpClient.getToken() );
		// 		await googleLoginPage.clickButton( 'Next' );
		// 	} );

		// 	it( 'Confirm terms and conditions', async function () {
		// 		if ( windowClosed ) {
		// 			return;
		// 		}

		// 		await googlePopupPage.waitForURL( /oauth/ );

		// 		const googlePopupPageClosePromise = googlePopupPage.waitForEvent( 'close' );

		// 		await googleLoginPage.clickButton( 'Continue' );

		// 		// The popup should close after the "Continue" button is clicked.
		// 		// If it does not, something has gone wrong.
		// 		await googlePopupPageClosePromise;
		// 	} );
		// } );

		// it( 'Redirected to woo.com upon successful login', async function () {
		// 	await page.waitForURL( /.*woo\.com*/ );
		// } );
	}
);
