/**
 * @group quarantined
 *
 * This test is quarantined because we would encounter "Too many verification codes have been sent" error if we run it too frequently.
 *
 */

import {
	SecretsManager,
	EmailClient,
	DataHelper,
	UserSignupPage,
	AppleLoginPage,
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
	DataHelper.createSuiteTitle( 'Signup: WordPress.com WPCC > WooCommerce via Apple' ),
	function () {
		const credentials = SecretsManager.secrets.testAccounts.appleLoginUser;
		let page: Page;
		let userSignupPage: UserSignupPage;
		let appleLoginPage: AppleLoginPage;
		let timestamp: Date;

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

			it( 'Click on Login with Apple button', async function () {
				await Promise.all( [
					page.waitForURL( /.*appleid\.apple\.com\/auth.*/ ),
					userSignupPage.clickContinueWithApple(),
				] );
			} );

			it( 'Enter Apple ID', async function () {
				appleLoginPage = new AppleLoginPage( page );
				await appleLoginPage.enterEmail( credentials.email as string );
				await appleLoginPage.pressEnter();
			} );

			it( 'Enter password', async function () {
				await appleLoginPage.enterPassword( credentials.password );
				await appleLoginPage.pressEnter();
				timestamp = new Date( Date.now() );
			} );

			it( 'Handle 2FA challenge', async function () {
				const url = page.url();

				// Handle potential 2FA challenge.
				if ( url.includes( 'appleid.apple.com/auth/authorize' ) ) {
					const emailClient = new EmailClient();
					const message = await emailClient.getLastMatchingMessage( {
						inboxId: SecretsManager.secrets.mailosaur.totpUserInboxId,
						receivedAfter: timestamp,
						subject: 'SMS',
						body: 'Your Apple ID Code is',
					} );

					const code = emailClient.get2FACodeFromMessage( message );

					await appleLoginPage.enter2FACode( code );
					await appleLoginPage.clickButtonWithExactText( 'Trust' );
				}
			} );

			it( 'Confirm login with Apple ID', async function () {
				await appleLoginPage.clickButtonContainingText( 'Continue' );
			} );

			it( 'Redirected to woo.com upon successful login', async function () {
				await page.waitForURL( /.*woo\.com*/ );
			} );
		} );
	}
);
