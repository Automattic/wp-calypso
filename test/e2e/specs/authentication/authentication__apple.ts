/**
 * @group authentication
 */

import {
	DataHelper,
	LoginPage,
	SecretsManager,
	AppleLoginPage,
	EmailClient,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Authentication: Apple' ), function () {
	const credentials = SecretsManager.secrets.testAccounts.appleLoginUser;
	let page: Page;
	let loginPage: LoginPage;
	let appleLoginPage: AppleLoginPage;
	let timestamp: Date;

	describe( 'WordPress.com', function () {
		beforeAll( async () => {
			page = await browser.newPage();
		} );

		it( 'Navigate to Login page', async function () {
			loginPage = new LoginPage( page );
			await loginPage.visit();
		} );

		it( 'Click on Login with Apple button', async function () {
			await Promise.all( [
				page.waitForNavigation( { url: /.*appleid\.apple\.com\/auth.*/ } ),
				loginPage.clickLoginWithApple(),
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
			await Promise.all( [
				page.waitForNavigation( { url: /.*\/home\/.*/ } ),
				appleLoginPage.clickButtonContainingText( 'Continue' ),
			] );
		} );

		afterAll( async () => {
			await page.close();
		} );
	} );

	describe( 'WooCommerce', function () {
		beforeAll( async () => {
			page = await browser.newPage();
		} );

		it( 'Navigate to Login page', async function () {
			loginPage = new LoginPage( page );
			await loginPage.visit( {
				path: SecretsManager.secrets.wooLoginPath,
			} );
		} );

		it( 'Click on Login with Apple button', async function () {
			await Promise.all( [
				page.waitForURL( /.*appleid\.apple\.com\/auth.*/ ),
				loginPage.clickLoginWithApple(),
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
} );
