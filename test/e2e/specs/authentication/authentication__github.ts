/**
 * @group authentication
 */

import { DataHelper, LoginPage, SecretsManager, GitHubLoginPage } from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Authentication: GitHub' ), function () {
	const credentials = SecretsManager.secrets.testAccounts.gitHubLoginUser;
	let page: Page;
	let loginPage: LoginPage;
	let githubLoginPage: GitHubLoginPage;

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
				page.waitForNavigation( { url: /.*github\.com\/login.*/ } ),
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

		it( 'Check if the user is logged in', async function () {
			// Wait for the login to complete.
			await page.waitForNavigation( { url: /.*wordpress\.com\/sites.*/ } );
		} );

		afterAll( async () => {
			await page.close();
		} );
	} );
} );
