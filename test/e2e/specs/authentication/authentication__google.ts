/**
 * @group authentication
 *
 *
 * Google blocks Chrome-based browsers that are controlled via automation
 * from performing login to their services.
 * The workaround is to use a non-Google browser, such as Firefox.
 * See: https://stackoverflow.com/questions/66209119/automation-google-login-with-python-and-selenium-shows-this-browser-or-app-may
 * @browser firefox
 */

import {
	DataHelper,
	LoginPage,
	SecretsManager,
	GoogleLoginPage,
	TOTPClient,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Authentication: Google' ), function () {
	const credentials = SecretsManager.secrets.testAccounts.googleLoginUser;
	let page: Page;
	let googlePopupPage: Page;
	let loginPage: LoginPage;
	let googleLoginPage: GoogleLoginPage;
	let challenge = false;

	beforeAll( async () => {
		page = await browser.newPage();
	} );

	it( 'Navigate to Login page', async function () {
		loginPage = new LoginPage( page );
		await loginPage.visit();
	} );

	it( 'Click on Google button', async function () {
		googlePopupPage = await loginPage.clickLoginWithGoogle();
	} );

	it( 'Enter Google username', async function () {
		googleLoginPage = new GoogleLoginPage( googlePopupPage );
		await googleLoginPage.enterUsername( credentials.username );
		await googleLoginPage.clickButton( 'Next' );
	} );

	it( 'Enter Google password', async function () {
		await googleLoginPage.enterPassword( credentials.password );
		await googleLoginPage.clickButton( 'Next' );

		try {
			await googlePopupPage.waitForEvent( 'close', { timeout: 5 * 1000 } );
		} catch {
			challenge = true;
		}
	} );

	it( 'Enter 2FA code if required', async function () {
		// Cannot use `skipItIf` here due to Jest pre-computing whether the
		// test steps run at runtime.
		if ( challenge ) {
			const totpClient = new TOTPClient( credentials.totpKey as string );
			const code = totpClient.getToken();

			await googleLoginPage.enter2FACode( code );
			await Promise.all( [
				googlePopupPage.waitForEvent( 'close' ),
				googleLoginPage.clickButton( 'Next' ),
			] );
		}
	} );

	it( 'Redirected to /home upon successful login', async function () {
		await page.waitForURL( /.*\/home\/.*/ );
	} );
} );
