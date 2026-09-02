/**
 * Google blocks Chrome-based browsers that are controlled via automation
 * from performing login to their services.
 * The workaround is to use a non-Google browser, such as Firefox.
 * See: https://stackoverflow.com/questions/66209119/automation-google-login-with-python-and-selenium-shows-this-browser-or-app-may
 *
 * The legacy Jest runner honored the `@browser firefox` docblock pragma;
 * Playwright Test does not, so this spec launches Firefox explicitly. The
 * mobile projects' Chromium device emulation cannot apply to that browser
 * (and Firefox does not support `isMobile`), so mobile coverage is kept by
 * sizing the Firefox viewport to match instead.
 */

import {
	DataHelper,
	GoogleLoginPage,
	SecretsManager,
	UserSignupPage,
	envVariables,
} from '@automattic/calypso-e2e';
import { firefox } from 'playwright';
import { tags, test } from '../../lib/pw-base';
import type { Page } from 'playwright';

test.describe(
	DataHelper.createSuiteTitle( 'Signup: WordPress.com WPCC > WooCommerce via Google' ),
	{ tag: [ tags.CALYPSO_RELEASE ] },
	() => {
		const credentials = SecretsManager.secrets.testAccounts.googleLoginUser;

		test( 'As a new user, I can begin signing up via WooCommerce WPCC with Google', async () => {
			// We can only run this spec for wordpress.com or wpcalypso.wordpress.com because only these two are allowed to use Google login.
			test.skip(
				! [ 'https://wordpress.com', 'https://wpcalypso.wordpress.com' ].includes(
					envVariables.CALYPSO_BASE_URL
				),
				'Only runs on wordpress.com or wpcalypso.wordpress.com'
			);

			const browser = await firefox.launch();

			try {
				// Playwright Test injects the active project's context options even
				// into browsers launched via the library, and Firefox rejects the
				// mobile projects' isMobile flag: neutralize it and set the mobile
				// size (Pixel 7 dimensions) directly.
				const page = await browser.newPage( {
					isMobile: false,
					...( envVariables.VIEWPORT_NAME === 'mobile'
						? { viewport: { width: 412, height: 915 } }
						: {} ),
				} );

				let googlePopupPage: Page;
				let googleLoginPage: GoogleLoginPage;

				await test.step( 'Navigate to WooCommerce WPCC endpoint', async () => {
					const calypsoBaseURL = DataHelper.getCalypsoURL();
					const wooAuthPath = SecretsManager.secrets.wooSignupPath;
					await page.goto( calypsoBaseURL + wooAuthPath );
				} );

				await test.step( 'Click on "Continue with Google" button', async () => {
					const userSignupPage = new UserSignupPage( page );
					googlePopupPage = await userSignupPage.clickContinueWithGoogle();
					await googlePopupPage.waitForURL( /accounts\.google\.com/ );
				} );

				await test.step( 'Enter Google username', async () => {
					await googlePopupPage.waitForURL( /identifier/ );
					googleLoginPage = new GoogleLoginPage( googlePopupPage );
					await googleLoginPage.enterUsername( credentials.username );
					await googleLoginPage.clickButton( 'Next' );
				} );

				// TODO: This test needs to be updated. There is a new recaptcha screen from google that needs to be handled
				// before a password can be entered p1719199948669409/1719199255.061099-slack-C02DQP0FP
			} finally {
				await browser.close();
			}
		} );
	}
);
