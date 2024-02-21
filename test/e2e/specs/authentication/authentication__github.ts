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
	let gitHubLoginPage: GitHubLoginPage;

	describe( 'WordPress.com', function () {
		beforeAll( async () => {
			page = await browser.newPage();
		} );

		it( 'Navigate to Login page', async function () {
			loginPage = new LoginPage( page );
			await loginPage.visit();
		} );

		it( 'Click on Login with GitHub button', async function () {
			// Without a short delay, the click might not work.
			await new Promise( ( resolve ) => setTimeout( resolve, 500 ) );

			await Promise.all( [
				page.waitForNavigation( { url: /.github.com.*/ } ),
				loginPage.clickLoginWithGitHub(),
			] );
		} );

		it( 'Enter email', async function () {
			gitHubLoginPage = new GitHubLoginPage( page );
			await gitHubLoginPage.enterEmail( credentials.email as string );
		} );

		it( 'Enter password', async function () {
			await gitHubLoginPage.enterPassword( credentials.password );
		} );

		it( 'Click submit', async function () {
			await gitHubLoginPage.clickSubmit();
		} );

		it( 'Authorize permissions', async function () {
			try {
				await gitHubLoginPage.tryToClickAuthorize();
			} catch ( error ) {}
		} );

		it( 'Confirm login with GitHub', async function () {
			await Promise.all( [ page.waitForNavigation( { url: /.*\/sites/ } ) ] );
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

		it( 'Click on Login with GitHub button', async function () {
			// Without a short delay, the click might not work.
			await new Promise( ( resolve ) => setTimeout( resolve, 500 ) );

			await Promise.all( [
				page.waitForNavigation( { url: /.github.com.*/ } ),
				loginPage.clickLoginWithGitHub(),
			] );
		} );

		it( 'Enter email', async function () {
			gitHubLoginPage = new GitHubLoginPage( page );
			await gitHubLoginPage.enterEmail( credentials.email as string );
		} );

		it( 'Enter password', async function () {
			await gitHubLoginPage.enterPassword( credentials.password );
		} );

		it( 'Click submit', async function () {
			await gitHubLoginPage.clickSubmit();
		} );

		it( 'Authorize permissions', async function () {
			try {
				await gitHubLoginPage.tryToClickAuthorize();
			} catch ( error ) {}
		} );

		it( 'Confirm login with GitHub', async function () {
			await Promise.all( [ page.waitForNavigation( { url: /.*\/sites/ } ) ] );
		} );

		afterAll( async () => {
			await page.close();
		} );
	} );
} );
