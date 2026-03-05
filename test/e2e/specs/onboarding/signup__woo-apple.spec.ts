/**
 * This test is quarantined because we would encounter "Too many verification codes have been sent" error if we run it too frequently.
 */

import {
	AppleLoginPage,
	DataHelper,
	EmailClient,
	SecretsManager,
	UserSignupPage,
	envVariables,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';

test.describe(
	DataHelper.createSuiteTitle( 'Signup: WordPress.com WPCC > WooCommerce via Apple' ),
	{ tag: [ tags.QUARANTINED ] },
	() => {
		const credentials = SecretsManager.secrets.testAccounts.appleLoginUser;

		test( 'As a new user, I can sign up via WooCommerce WPCC with Apple', async ( { page } ) => {
			// We can only run this spec for wordpress.com or wpcalypso.wordpress.com because only these two are allowed to use Apple login.
			test.skip(
				! [ 'https://wordpress.com', 'https://wpcalypso.wordpress.com' ].includes(
					envVariables.CALYPSO_BASE_URL
				),
				'Only runs on wordpress.com or wpcalypso.wordpress.com'
			);

			let timestamp: Date;
			let appleLoginPage: AppleLoginPage;

			await test.step( 'Navigate to WooCommerce WPCC endpoint', async () => {
				const calypsoBaseURL = DataHelper.getCalypsoURL();
				const wooAuthPath = SecretsManager.secrets.wooSignupPath;
				await page.goto( calypsoBaseURL + wooAuthPath );
			} );

			await test.step( 'Click on Login with Apple button', async () => {
				const userSignupPage = new UserSignupPage( page );
				await Promise.all( [
					page.waitForURL( /.*appleid\.apple\.com\/auth.*/ ),
					userSignupPage.clickContinueWithApple(),
				] );
			} );

			await test.step( 'Enter Apple ID', async () => {
				appleLoginPage = new AppleLoginPage( page );
				await appleLoginPage.enterEmail( credentials.email as string );
				await appleLoginPage.pressEnter();
			} );

			await test.step( 'Enter password', async () => {
				await appleLoginPage.enterPassword( credentials.password );
				await appleLoginPage.pressEnter();
				timestamp = new Date( Date.now() );
			} );

			await test.step( 'Handle 2FA challenge', async () => {
				const url = page.url();

				const hasRateLimit = await appleLoginPage.hasRateLimitMessage();
				if ( hasRateLimit ) {
					test.skip();
					return;
				}

				if ( url.includes( 'appleid.apple.com/auth/authorize' ) ) {
					const sendCodeVisible = await appleLoginPage.hasButtonWithExactText( 'Send code' );

					if ( sendCodeVisible ) {
						await appleLoginPage.clickButtonWithExactText( 'Send code' );
					}

					await page.waitForTimeout( 5000 );

					const emailClient = new EmailClient();
					const message = await emailClient.getLastMatchingMessage( {
						inboxId: SecretsManager.secrets.mailosaur.totpUserInboxId,
						receivedAfter: timestamp,
						subject: 'SMS',
						body: 'Your Apple Account code is',
					} );

					const code = emailClient.get2FACodeFromMessage( message );

					await appleLoginPage.enter2FACode( code );
					await appleLoginPage.clickButtonWithExactText( 'Trust' );
				}
			} );

			await test.step( 'Confirm login with Apple ID', async () => {
				await appleLoginPage.clickButtonContainingText( 'Continue' );
			} );

			await test.step( 'Redirected to WordPress.com OAuth2 user page', async () => {
				await page.waitForURL( /.*\/start\/wpcc\/oauth2-user.*/ );
			} );
		} );
	}
);
