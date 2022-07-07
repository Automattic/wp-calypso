/**
 * @group authentication
 * @group calypso-release
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
	EmailClient,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';
import { skipItIf } from '../../jest-helpers';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Authentication: Google' ), function () {
	const credentials = SecretsManager.secrets.testAccounts.googleLoginUser;
	let page: Page;
	let googlePopupPage: Page;
	let loginPage: LoginPage;
	let googleLoginPage: GoogleLoginPage;
	let emailClient: EmailClient;
	let challenge = false;

	beforeAll( async () => {
		emailClient = new EmailClient();

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

		try {
			await Promise.all( [
				googlePopupPage.waitForEvent( 'close', { timeout: 5 * 1000 } ),
				googleLoginPage.clickButton( 'Next' ),
			] );
		} catch {
			challenge = true;
		}
		console.log( challenge );
	} );

	describe( 'Complete 2FA', function () {
		skipItIf( ! challenge )( 'Enter 2FA phone number', async function () {
			expect( await googleLoginPage.isChallengeShown() ).toBe( true );

			await googleLoginPage.enter2FAPhoneNumber( credentials.smsNumber?.number as string );
			await googleLoginPage.clickButton( 'Next' );
		} );

		skipItIf( ! challenge )( 'Enter 2FA code', async function () {
			const message = await emailClient.getLastMatchingMessage( {
				inboxId: SecretsManager.secrets.mailosaur.totpUserInboxId,
				sentFrom: '18339020110',
			} );
			const rawCode = emailClient.get2FACodeFromMessage( message );
			const code = rawCode.match( /[\d]{6}$/ );
			if ( ! code ) {
				throw new Error( 'Failed to extract Google 2FA code.' );
			}

			await googleLoginPage.enter2FACode( code[ 0 ] );
		} );
	} );

	it( 'Redirected to /home upon successful login', async function () {
		await page.waitForURL( /.*\/home\/.*/ );
	} );
} );
