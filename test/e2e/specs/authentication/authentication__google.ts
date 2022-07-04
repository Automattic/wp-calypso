/**
 * @group authentication
 * @group calypso-pr
 */

import { DataHelper, LoginPage, SecretsManager, GoogleLoginPage } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Authentication: Google' ), function () {
	const credentials = SecretsManager.secrets.testAccounts.googleLoginUser;
	let page: Page;
	let googlePopupPage: Page;
	let loginPage: LoginPage;
	let googleLoginPage: GoogleLoginPage;

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

	it( 'Enter Gmail address and password', async function () {
		googleLoginPage = new GoogleLoginPage( googlePopupPage );
		await googleLoginPage.enterCredentials( {
			email: credentials.username,
			password: credentials.password,
		} );
	} );

	it( 'Redirected to /home after submit', async function () {
		await Promise.all( [
			page.waitForNavigation( { url: /.*\/home\/.*/ } ),
			googleLoginPage.clickButton( 'Next' ),
		] );
	} );
} );
