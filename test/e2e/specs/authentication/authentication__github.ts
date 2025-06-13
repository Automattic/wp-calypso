/**
 * @group authentication
 * @browser firefox
 */
import {
	DataHelper,
	LoginPage,
	SecretsManager,
	GitHubLoginPage,
	EmailClient,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Authentication: GitHub' ), function () {
	const credentials = SecretsManager.secrets.testAccounts.gitHubLoginUser;
	let page: Page;
	let loginPage: LoginPage;
	let githubLoginPage: GitHubLoginPage;
	let timestamp: Date;

	describe( 'WordPress.com', function () {
		beforeAll( async () => {
			page = await browser.newPage();
		} );

		it( 'Navigate to Login page', async function () {
			loginPage = new LoginPage( page );
			await loginPage.visit();
		} );

		it( 'Click on Login with GitHub button', async function () {
			await Promise.all( [
				page.waitForURL( /.*github\.com\/login.*/ ),
				loginPage.clickLoginWithGitHub(),
			] );
		} );

		it( 'Enter GitHub username', async function () {
			githubLoginPage = new GitHubLoginPage( page );
			await githubLoginPage.enterEmail( credentials.username as string );
			await githubLoginPage.pressEnter();
		} );

		it( 'Enter GitHub password', async function () {
			await githubLoginPage.enterPassword( credentials.password );
			await githubLoginPage.pressEnter();
		} );

		it( 'Press Send SMS', async function () {
			timestamp = new Date( Date.now() );
			await githubLoginPage.clickButtonContainingText( 'Send SMS' );
		} );

		it( 'Handle SMS two-factor authentication', async function () {
			const emailClient = new EmailClient();

			const message = await emailClient.getLastMatchingMessage( {
				inboxId: SecretsManager.secrets.mailosaur.totpUserInboxId,
				receivedAfter: timestamp,
				subject: 'SMS',
				body: 'GitHub authentication code',
			} );

			const code = emailClient.get2FACodeFromMessage( message );

			await githubLoginPage.enter2FACode( code );
		} );

		it( 'Handle GitHub device verification if needed', async function () {
			// GitHub may show a device verification screen in CI
			const verificationUrl = 'https://github.com/sessions/verified-device';
			const response = await page.waitForNavigation();

			if ( ! response ) {
				throw new Error( 'Navigation failed - no response received' );
			}

			if ( response.url() === verificationUrl ) {
				// If we're on the verification screen, click the verify button
				await githubLoginPage.clickButtonWithExactText( 'Verify' );
			}
		} );

		it( 'Skip GitHub trust device if needed', async function () {
			// GitHub may show a device verification screen in CI
			const verificationUrl = 'https://github.com/sessions/trusted-device';
			const response = await page.waitForNavigation();

			if ( ! response ) {
				throw new Error( 'Navigation failed - no response received' );
			}

			if ( response.url() === verificationUrl ) {
				// If we're on the trusted device screen, skip it
				await githubLoginPage.clickButtonWithExactText( "Don't ask again for this browser" );
			}
		} );

		it( 'Verify successful login to WordPress.com', async function () {
			await page.waitForURL( /.*wordpress\.com\/log-in\/github\/callback.*/ );
			await page.waitForURL( /.*wordpress\.com\/sites.*/ );

			expect( page.url() ).toMatch( /.*wordpress\.com\/sites.*/ );
		} );

		afterAll( async () => {
			await page.close();
		} );
	} );
} );
